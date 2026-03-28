# scrapers/__init__.py

import json
from .food_price_scraper import DogFoodScraper
from .vet_price_scraper import VetServiceScraper

__all__ = ["DogFoodScraper", "VetServiceScraper"]
