# scrapers/food_price_scraper.py
from __future__ import annotations
import re
import logging
from urllib.parse import urljoin
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from base_scraper import BaseScraper

logger = logging.getLogger(__name__)

# Updated to include common PCG brands
KNOWN_BRANDS = [
    "SmartHeart", "LuvCare", "A Pro", "Classic Pets", "Me-O",
    "Royal Canin", "Hill's", "Hills", "Purina", "Pedigree"
]

class DogFoodScraper(BaseScraper):
    """Scrapes dog food product listings from PCG Shop Online."""

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def scrape_pcg(
        self,
        max_pages: int = 1,
    ) -> list[dict]:
        """
        Returns a list of dicts:
            product_name, brand, price_thb, weight_kg, source_url
        """
        self.init_driver()
        results = []
        base_url = "https://pcgshoponline.com/categories/Dog-Food"
        assert self.driver is not None, "Driver must be initialized"

        try:
            for page in range(1, max_pages + 1):
                # Standard pagination format
                url = f"{base_url}/categories/Dog-Food?page={page}"
                logger.info("Scraping PCG page %d → %s", page, url)
                self.driver.get(url)

                # Wait for standard e-commerce product containers to render
                try:
                    WebDriverWait(self.driver, 15).until(
                        EC.presence_of_element_located(
                            (By.CSS_SELECTOR, ".product-item, [class*='product-card'], .product-layout")
                        )
                    )
                    logger.info("Page %d: Products rendered, parsing cards", page)
                except Exception:
                    logger.warning("Page %d: timed out waiting for cards. Page might be empty.", page)

                self.scroll_down(steps=3)   # trigger lazy-load images
                self.random_delay(1, 2)

                page_results = self._parse_pcg_page(url)
                
                # Break the loop if we hit an empty page (end of pagination)
                if not page_results:
                    logger.info("No more products found on page %d, stopping pagination.", page)
                    break
                    
                logger.info("Page %d: found %d products", page, len(page_results))
                results.extend(page_results)

                self.random_delay(2, 4)     # polite gap between pages

        except Exception as e:
            logger.error("PCG scrape failed: %s", e)
            raise
        finally:
            self.quit()

        return results

    # ------------------------------------------------------------------
    # Internal parsers
    # ------------------------------------------------------------------

    def _parse_pcg_page(self, current_url: str) -> list[dict]:
        # Generic fallback selectors for typical standard e-commerce frameworks
        CONTAINER_SELECTORS = [
            ".product-item", 
            "[class*='product-card']",
            ".product-layout",
            ".product"
        ]
        
        products = []
        for sel in CONTAINER_SELECTORS:
            products = self.safe_find_all(By.CSS_SELECTOR, sel)
            if products:
                logger.info("Matched container selector: %s (%d items)", sel, len(products))
                break

        if not products:
            if self.driver:
                from pathlib import Path
                from datetime import datetime
                debug_dir = Path(__file__).parent.parent / "output"
                debug_dir.mkdir(exist_ok=True)
                ts = datetime.now().strftime("%Y%m%d_%H%M%S")
                debug_file = debug_dir / f"pcg_debug_{ts}.html"
                debug_file.write_text(self.driver.page_source, encoding="utf-8")
                logger.warning(
                    "⚠️  0 products found — page source saved to %s",
                    debug_file,
                )

        results = []
        for product in products:
            record = self._parse_product_card(product, current_url)
            if record:
                results.append(record)
        return results

    def _parse_product_card(self, card, current_url: str) -> dict | None:
        try:
            # ── Product name ───────────────────────────────────────────────
            name = None
            NAME_SELECTORS = [
                ".product-name",
                "h3",
                "h4",
                ".name a",
                "a[title]"
            ]
            for sel in NAME_SELECTORS:
                try:
                    el = card.find_element(By.CSS_SELECTOR, sel)
                    name = el.text.strip() or el.get_attribute("title")
                    if name:
                        break
                except Exception:
                    continue
            if not name:
                return None

            # ── Price ───────────────────────────────────────────────────────
            price_text = None
            PRICE_SELECTORS = [
                ".price",
                ".price-new",
                "[class*='price']"
            ]
            for sel in PRICE_SELECTORS:
                try:
                    el = card.find_element(By.CSS_SELECTOR, sel)
                    t = el.text.strip()
                    if t and any(c.isdigit() for c in t):
                        price_text = t
                        break
                except Exception:
                    continue
            if not price_text:
                return None
            price = self._parse_price(price_text)
            if price is None:
                return None

            # ── URL ─────────────────────────────────────────────────────────
            product_url = current_url # Fallback
            try:
                link_el = card.find_element(By.CSS_SELECTOR, "a")
                href = link_el.get_attribute("href")
                if href:
                    # Convert relative URL to absolute URL if necessary
                    product_url = urljoin("https://pcgshoponline.com", href)
            except Exception:
                pass

            weight_kg = self._extract_weight(name)
            brand = self._extract_brand(name)

            price_per_kg = None
            if price and weight_kg and weight_kg > 0:
                price_per_kg = round(price / weight_kg, 2)
            
            # Smart fallback: PCG brands are often the first word if not in KNOWN_BRANDS
            if brand == "Unknown" and name:
                brand = name.split()[0]

            return {
                "product_name": name.strip()[:255],
                "brand": brand[:100],
                "price_thb": price,
                "weight_kg": weight_kg,
                "price_per_kg": price_per_kg,
                "source_url": product_url,
            }
        except Exception as e:
            logger.debug("Card parse error: %s", e)
            return None

    def _try_selectors(self, element, selectors: list[str]) -> str | None:
        for sel in selectors:
            try:
                el = element.find_element(By.CSS_SELECTOR, sel)
                text = el.get_attribute("title") or el.text
                if text and text.strip():
                    return text.strip()
            except Exception:
                continue
        return None

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_price(text: str) -> float | None:
        cleaned = re.sub(r"[^\d.]", "", text)
        try:
            return float(cleaned)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _extract_weight(name: str) -> float | None:
        """Extract kg weight from product name string."""
        # Match patterns like: 20kg, 1.5 kg, 500g, 10 กก
        match = re.search(r"(\d+(?:\.\d+)?)\s*(kg|กก|kilogram)", name, re.IGNORECASE)
        if match:
            return float(match.group(1))
        match_g = re.search(r"(\d+)\s*g(?:ram)?(?!\w)", name, re.IGNORECASE)
        if match_g:
            return round(int(match_g.group(1)) / 1000, 3)
        return None

    @staticmethod
    def _extract_brand(product_name: str) -> str:
        for brand in KNOWN_BRANDS:
            if brand.lower() in product_name.lower():
                return brand
        return "Unknown"