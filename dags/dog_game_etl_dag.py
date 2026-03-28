# dags/dog_game_etl_dag.py
"""
Monthly ETL pipeline for the Dog Care Simulation game.

Flow per run:
  extract_dog_food ──┐
                     ├─► validate ─► load ─► update_breed_costs
  extract_vet ───────┘

Imports of scrapers/utils are LAZY (inside task functions) so that
Airflow can parse the DAG without needing those packages pre-installed
at parse time. They only need to be available when tasks actually execute.
"""
from __future__ import annotations

import os
import sys
import logging
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator # type: ignore

logger = logging.getLogger(__name__)

# Make project packages importable inside Airflow workers
# (mapped via docker-compose volumes)
_PROJECT_ROOT = "/opt/airflow"
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

# ---------------------------------------------------------------------------
# DB config — read from container environment (set via .env + docker-compose)
# ---------------------------------------------------------------------------
DB_CONFIG = {
    "host": os.getenv("GAME_DB_HOST", "postgres_game"),
    "port": int(os.getenv("GAME_DB_PORT", "5432")),
    "dbname": os.getenv("GAME_DB_NAME", "dog_game_db"),
    "user": os.getenv("GAME_DB_USER", "gameuser"),
    "password": os.getenv("GAME_DB_PASSWORD", "gamepass"),
}

# ---------------------------------------------------------------------------
# Default args
# ---------------------------------------------------------------------------
default_args = {
    "owner": "dog-game-team",
    "retries": 2,
    "retry_delay": timedelta(minutes=10),
    "email_on_failure": False,
}

# ---------------------------------------------------------------------------
# Task functions — all imports are LAZY (inside function body)
# ---------------------------------------------------------------------------

def extract_dog_food(**context) -> None:
    # Lazy import: only needed when task runs, not at DAG parse time
    from scrapers.food_price_scraper import DogFoodScraper  # noqa: PLC0415

    scraper = DogFoodScraper()
    data = scraper.scrape_pcg(max_pages=3)
    logger.info("Extracted %d raw dog food records", len(data))
    context["ti"].xcom_push(key="raw_food_data", value=data)


def extract_vet_services(**context) -> None:
    from scrapers.vet_price_scraper import VetServiceScraper  # noqa: PLC0415

    scraper = VetServiceScraper()
    data = scraper.scrape_moderndog()
    logger.info("Extracted %d raw vet service records", len(data))
    context["ti"].xcom_push(key="raw_vet_data", value=data)


def validate_dog_food(**context) -> None:
    from utils.data_validator import DogFoodValidator  # noqa: PLC0415

    raw = context["ti"].xcom_pull(key="raw_food_data") or []
    result = DogFoodValidator().validate_and_clean(raw)
    if result.errors:
        logger.warning("Food validation warnings:\n%s", "\n".join(result.errors))
    logger.info("Food stats: %s", result.stats)
    context["ti"].xcom_push(key="clean_food_data", value=result.cleaned_data)


def validate_vet_services(**context) -> None:
    from utils.data_validator import VetServiceValidator  # noqa: PLC0415

    raw = context["ti"].xcom_pull(key="raw_vet_data") or []
    result = VetServiceValidator().validate_and_clean(raw)
    if result.errors:
        logger.warning("Vet validation warnings:\n%s", "\n".join(result.errors))
    logger.info("Vet stats: %s", result.stats)
    context["ti"].xcom_push(key="clean_vet_data", value=result.cleaned_data)


def load_dog_food(**context) -> None:
    from utils.db_loader import PostgresLoader  # noqa: PLC0415

    data = context["ti"].xcom_pull(key="clean_food_data") or []
    result = PostgresLoader(**DB_CONFIG).upsert_dog_food(data, context["run_id"])
    logger.info("Dog food load result: %s", result)


def load_vet_services(**context) -> None:
    from utils.db_loader import PostgresLoader  # noqa: PLC0415

    data = context["ti"].xcom_pull(key="clean_vet_data") or []
    result = PostgresLoader(**DB_CONFIG).upsert_vet_services(data, context["run_id"])
    logger.info("Vet service load result: %s", result)


def update_breed_costs(**context) -> None:
    """Recalculate average costs in dog_breeds after all loads complete."""
    from utils.db_loader import PostgresLoader  # noqa: PLC0415

    result = PostgresLoader(**DB_CONFIG).update_breed_costs(context["run_id"])
    logger.info("Breed cost update result: %s", result)


# ---------------------------------------------------------------------------
# DAG definition
# ---------------------------------------------------------------------------
with DAG(
    dag_id="dog_game_monthly_etl",
    default_args=default_args,
    description="Monthly scrape → validate → load pipeline for dog game DB",
    schedule="*/2 * * * *",          # 02:00 on the 1st of every month
    start_date=datetime(2026, 3, 17),
    catchup=False,
    tags=["dog-game", "etl", "scraping"],
) as dag:

    # ── Extract (parallel) ──────────────────────────────────────────────
    t_extract_food = PythonOperator(
        task_id="extract_dog_food",
        python_callable=extract_dog_food,
    )

    t_extract_vet = PythonOperator(
        task_id="extract_vet_services",
        python_callable=extract_vet_services,
    )

    # ── Validate (parallel) ─────────────────────────────────────────────
    t_validate_food = PythonOperator(
        task_id="validate_dog_food",
        python_callable=validate_dog_food,
    )

    t_validate_vet = PythonOperator(
        task_id="validate_vet_services",
        python_callable=validate_vet_services,
    )

    # ── Load (parallel) ─────────────────────────────────────────────────
    t_load_food = PythonOperator(
        task_id="load_dog_food",
        python_callable=load_dog_food,
    )

    t_load_vet = PythonOperator(
        task_id="load_vet_services",
        python_callable=load_vet_services,
    )

    # ── Post-load aggregation ───────────────────────────────────────────
    t_update_breeds = PythonOperator(
        task_id="update_breed_costs",
        python_callable=update_breed_costs,
    )

    # ── Pipeline wiring ─────────────────────────────────────────────────
    #
    #   extract_food ──► validate_food ──► load_food ──┐
    #                                                   ├──► update_breed_costs
    #   extract_vet  ──► validate_vet  ──► load_vet  ──┘
    #
    t_extract_food >> t_validate_food >> t_load_food >> t_update_breeds
    t_extract_vet  >> t_validate_vet  >> t_load_vet  >> t_update_breeds
