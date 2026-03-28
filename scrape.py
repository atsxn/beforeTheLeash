"""
scrape.py — Local one-off runner (for testing outside Airflow)

Usage:
    python scrape.py food      # scrape dog food only
    python scrape.py vet       # scrape vet services only
    python scrape.py all       # scrape everything (default)

If the database is unreachable, results are saved as JSON under ./output/
"""
from __future__ import annotations

import sys
import os
import json
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("scrape_runner")

from scrapers.food_price_scraper import DogFoodScraper
from scrapers.vet_price_scraper import VetServiceScraper
from utils.data_validator import DogFoodValidator, VetServiceValidator
from utils.db_loader import PostgresLoader

DB_CONFIG = {
    "host": os.getenv("GAME_DB_HOST", "localhost"),
    "port": int(os.getenv("GAME_DB_PORT", "5432")),
    "dbname": os.getenv("GAME_DB_NAME", "dog_game_db"),
    "user": os.getenv("GAME_DB_USER", "gameuser"),
    "password": os.getenv("GAME_DB_PASSWORD", "gamepass"),
}

RUN_ID = "manual_run"
OUTPUT_DIR = Path(__file__).parent / "output"


def _save_json(data: list[dict], label: str) -> Path:
    """Save data to a timestamped JSON file and return the path."""
    OUTPUT_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = OUTPUT_DIR / f"{label}_{timestamp}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info("💾 Saved %d records to %s", len(data), path)
    return path


def _try_db_load(loader_fn, data, run_id, label: str) -> None:
    """Attempt to load into DB; fall back to JSON if connection fails."""
    try:
        out = loader_fn(data, run_id)
        logger.info("Load result: %s", out)
    except Exception as e:
        logger.warning(
            "⚠️  DB unavailable (%s) — saving %d records to JSON instead.",
            e, len(data),
        )
        _save_json(data, label)


def run_food() -> None:
    logger.info("=== Scraping dog food ===")
    raw = DogFoodScraper().scrape_lazada(max_pages=2)
    result = DogFoodValidator().validate_and_clean(raw)
    logger.info("Stats: %s", result.stats)
    loader = PostgresLoader(**DB_CONFIG)
    _try_db_load(loader.upsert_dog_food, result.cleaned_data, RUN_ID, "food")


def run_vet() -> None:
    logger.info("=== Scraping vet services ===")
    raw = VetServiceScraper().scrape_moderndog()
    result = VetServiceValidator().validate_and_clean(raw)
    logger.info("Stats: %s", result.stats)
    loader = PostgresLoader(**DB_CONFIG)
    _try_db_load(loader.upsert_vet_services, result.cleaned_data, RUN_ID, "vet")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"

    if mode in ("food", "all"):
        run_food()
    if mode in ("vet", "all"):
        run_vet()
    if mode == "all":
        try:
            PostgresLoader(**DB_CONFIG).update_breed_costs(RUN_ID)
        except Exception as e:
            logger.warning("⚠️  update_breed_costs skipped — DB unavailable: %s", e)

    logger.info("Done.")
