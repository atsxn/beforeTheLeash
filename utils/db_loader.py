# utils/db_loader.py
from __future__ import annotations

import logging
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values

logger = logging.getLogger(__name__)


class PostgresLoader:
    """
    Handles all INSERT / UPSERT operations to the game PostgreSQL database.
    Uses a single connection per operation — safe for Airflow task isolation.
    """

    def __init__(self, host: str, port: int, dbname: str,
                 user: str, password: str):
        self.conn_params: dict = {
            "host": host,
            "port": port,
            "dbname": dbname,
            "user": user,
            "password": password,
        }

    # ------------------------------------------------------------------
    # Connection helper
    # ------------------------------------------------------------------

    def get_connection(self):
        return psycopg2.connect(**self.conn_params)

    # ------------------------------------------------------------------
    # Dog food products
    # ------------------------------------------------------------------

    def upsert_dog_food(self, records: list, dag_run_id: str) -> dict:
        """
        1. Marks records older than 35 days as inactive.
        2. Bulk-inserts new batch.
        3. Writes a row to scrape_logs.
        Returns {"inserted": <n>, "skipped": <n>}
        """
        if not records:
            logger.warning("upsert_dog_food called with empty list")
            self._write_log(dag_run_id, "dog_food_products", 0, 0, 0, "success")
            return {"inserted": 0, "skipped": 0}

        conn = self.get_connection()
        inserted: int = 0
        skipped: int = 0

        try:
            with conn.cursor() as cur:
                # Deactivate stale rows
                cur.execute("""
                    UPDATE dog_food_products
                    SET    is_active = FALSE
                    WHERE  scraped_at < NOW() - INTERVAL '35 days'
                      AND  is_active = TRUE
                """)

                # Prepare value tuples
                values = []
                for r in records:
                    if not r.get("product_name") or not r.get("price_thb") :
                        skipped = skipped + 1
                        continue
                    values.append((
                        r["product_name"],
                        r.get("brand"),
                        r["price_thb"],
                        r.get("weight_kg"),
                        r.get("price_per_kg"),
                        r.get("source_url"),
                        datetime.now(),
                        True,
                    ))

                if values:
                    execute_values(cur, """
                        INSERT INTO dog_food_products
                            (product_name, brand, price_thb, weight_kg,price_per_kg,
                             source_url, scraped_at, is_active)
                        VALUES %s
                    """, values)
                    inserted = len(values)

                self._write_log_cursor(
                    cur, dag_run_id, "dog_food_products",
                    len(records), inserted, skipped, "success"
                )
                conn.commit()

        except Exception as e:
            conn.rollback()
            logger.error("upsert_dog_food failed: %s", e)
            self._write_log(
                dag_run_id, "dog_food_products",
                len(records), 0, 0, "failed", str(e)
            )
            raise
        finally:
            conn.close()

        logger.info("Dog food → inserted=%d skipped=%d", inserted, skipped)
        return {"inserted": inserted, "skipped": skipped}

    # ------------------------------------------------------------------
    # Aggregate breed cost summary
    # ------------------------------------------------------------------

    def update_breed_costs(self, dag_run_id: str) -> dict:
        """
        Re-calculates avg monthly food cost per breed size using:
            avg_price_per_kg  (from active dog_food_products)
            × estimated monthly consumption kg per size category

        Monthly consumption reference (rough average):
            small  ~1.5 kg/month
            medium ~5.0 kg/month
            large  ~12.0 kg/month
            giant  ~20.0 kg/month
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    WITH food_stats AS (
                        SELECT AVG(price_per_kg) AS avg_price_per_kg
                        FROM   dog_food_products
                        WHERE  is_active = TRUE
                          AND  price_per_kg IS NOT NULL
                    )
                    UPDATE dog_breeds db
                    SET    avg_monthly_food_cost_thb = ROUND(
                               fs.avg_price_per_kg * CASE db.size_category
                                   WHEN 'small'  THEN 1.5
                                   WHEN 'medium' THEN 5.0
                                   WHEN 'large'  THEN 12.0
                                   WHEN 'giant'  THEN 20.0
                                   ELSE 5.0
                               END
                           , 2),
                           last_updated = NOW()
                    FROM   food_stats fs
                    WHERE  fs.avg_price_per_kg IS NOT NULL
                """)
                updated_rows = cur.rowcount
                self._write_log_cursor(
                    cur, dag_run_id, "breed_cost_update",
                    0, 0, 0, "success"
                )
                conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error("update_breed_costs failed: %s", e)
            raise
        finally:
            conn.close()

        logger.info("Breed costs updated for %d breeds", updated_rows)
        return {"updated_breeds": updated_rows}

    # ------------------------------------------------------------------
    # Log helpers
    # ------------------------------------------------------------------

    def _write_log_cursor(
        self, cur, dag_run_id: str, source_name: str,
        scraped: int, inserted: int, skipped: int,
        status: str, error: str | None = None
    ) -> None:
        cur.execute("""
            INSERT INTO scrape_logs
                (dag_run_id, source_name, records_scraped, records_inserted,
                 records_skipped, status, error_message, finished_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """, (dag_run_id, source_name, scraped, inserted, skipped, status, error))

    def _write_log(self, dag_run_id: str, source_name: str,
                   scraped: int, inserted: int, skipped: int,
                   status: str, error: str | None = None) -> None:
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                self._write_log_cursor(
                    cur, dag_run_id, source_name,
                    scraped, inserted, skipped, status, error
                )
            conn.commit()
        finally:
            conn.close()