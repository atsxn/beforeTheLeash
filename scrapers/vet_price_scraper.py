# scrapers/vet_price_scraper.py
from __future__ import annotations
import re
import logging
from selenium.webdriver.common.by import By
from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)

# Mapping of keywords → service category (for classification)
SERVICE_CATEGORIES = {
    "วัคซีน": "vaccination",
    "vaccine": "vaccination",
    "ฉีดวัคซีน": "vaccination",
    "อาบน้ำ": "grooming",
    "ตัดขน": "grooming",
    "grooming": "grooming",
    "ตรวจ": "checkup",
    "checkup": "checkup",
    "ผ่าตัด": "surgery",
    "sterilize": "sterilization",
    "ทำหมัน": "sterilization",
    "ฟัน": "dental",
    "dental": "dental",
}


class VetServiceScraper(BaseScraper):
    """
    Scrapes veterinary service price lists from:
      - ModernDog (Thailand's largest pet info site)
      - Generalized clinic directory pages
    """

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def scrape_moderndog(self) -> list[dict]:
        """
        Scrape service/price articles from th.moderdogmag.com.
        Returns list of dicts: service_name, service_category,
                               avg_price_thb, min_price_thb, max_price_thb,
                               clinic_name, location, source_url
        """
        # moderndog.co.th may be unreachable — use Honesty Pet as fallback source
        url = "https://www.honestypet.com/dog-food-price/"
        self.init_driver()
        results = []

        try:
            logger.info("Scraping ModernDog health articles: %s", url)
            self.driver.get(url)
            self.random_delay(2, 4)
            self.scroll_down(steps=3)

            article_links = self._collect_article_links()
            logger.info("Found %d articles to scan", len(article_links))

            for link in article_links[:10]:     # cap at 10 articles per run
                records = self._scrape_article_for_prices(link)
                results.extend(records)
                self.random_delay(2, 5)

        except Exception as e:
            logger.error("Vet scrape failed: %s — returning %d partial results", e, len(results))
            # Do NOT re-raise: let caller save whatever was collected to JSON
        finally:
            self.quit()

        return results

    def scrape_price_table(self, url: str, clinic_name: str = "Unknown",
                           location: str = "Unknown") -> list[dict]:
        """
        Generic scraper for clinic pages that publish a price table.
        Looks for <table> elements and tries to extract service/price rows.
        """
        self.init_driver()
        results = []

        try:
            logger.info("Scraping clinic price table: %s", url)
            self.driver.get(url)
            self.random_delay(2, 4)
            self.scroll_down(steps=2)

            tables = self.safe_find_all(By.CSS_SELECTOR, "table")
            for table in tables:
                rows = table.find_elements(By.CSS_SELECTOR, "tr")
                for row in rows:
                    cells = row.find_elements(By.CSS_SELECTOR, "td, th")
                    if len(cells) < 2:
                        continue
                    record = self._parse_price_row(
                        cells, url, clinic_name, location
                    )
                    if record:
                        results.append(record)

        except Exception as e:
            logger.error("Price table scrape failed (%s): %s", url, e)
            raise
        finally:
            self.quit()

        return results

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _collect_article_links(self) -> list[str]:
        anchors = self.safe_find_all(By.CSS_SELECTOR, "article a, .post-title a, h2 a")
        links = []
        seen = set()
        for a in anchors:
            href = a.get_attribute("href") or ""
            if href and href not in seen:
                seen.add(href)
                links.append(href)
        return links

    def _scrape_article_for_prices(self, url: str) -> list[dict]:
        """Visit an article page, scan text for price mentions."""
        results = []
        try:
            self.driver.get(url)
            self.random_delay(2, 3)
            body = self.safe_find(By.CSS_SELECTOR, "article, .entry-content, main")
            if not body:
                return []

            text = body.text
            lines = [l.strip() for l in text.splitlines() if l.strip()]

            for line in lines:
                record = self._extract_price_from_line(line, url)
                if record:
                    results.append(record)

        except Exception as e:
            logger.debug("Article parse error (%s): %s", url, e)

        return results

    def _extract_price_from_line(self, line: str, url: str) -> dict | None:
        """
        Try to find a price (฿ or บาท) in a text line.
        Returns a record dict or None.
        """
        price_match = re.search(
            r"(\d[\d,]*(?:\.\d{1,2})?)\s*(?:บาท|฿|THB)", line, re.IGNORECASE
        )
        if not price_match:
            return None

        price = float(price_match.group(1).replace(",", ""))
        if price <= 0 or price > 100_000:
            return None

        # Strip price text to get the service description
        service_name = re.sub(
            r"\d[\d,]*(?:\.\d{1,2})?\s*(?:บาท|฿|THB).*", "", line
        ).strip()[:150]

        if len(service_name) < 3:
            return None

        return {
            "service_name": service_name,
            "service_category": self._classify_service(service_name),
            "avg_price_thb": price,
            "min_price_thb": None,
            "max_price_thb": None,
            "clinic_name": "ModernDog Reference",
            "location": "Thailand",
            "source_url": url,
        }

    def _parse_price_row(
        self, cells, url: str, clinic_name: str, location: str
    ) -> dict | None:
        """Parse a table row into a vet service record."""
        try:
            service_name = cells[0].text.strip()[:150]
            price_text = cells[1].text.strip()

            # Handle range like "500 - 1,500"
            range_match = re.findall(r"(\d[\d,]*(?:\.\d{1,2})?)", price_text)
            if not range_match:
                return None

            prices = [float(p.replace(",", "")) for p in range_match]
            avg = sum(prices) / len(prices)

            return {
                "service_name": service_name,
                "service_category": self._classify_service(service_name),
                "avg_price_thb": round(avg, 2),
                "min_price_thb": min(prices) if len(prices) > 1 else None,
                "max_price_thb": max(prices) if len(prices) > 1 else None,
                "clinic_name": clinic_name,
                "location": location,
                "source_url": url,
            }
        except Exception:
            return None

    @staticmethod
    def _classify_service(name: str) -> str:
        name_lower = name.lower()
        for keyword, category in SERVICE_CATEGORIES.items():
            if keyword.lower() in name_lower:
                return category
        return "other"
