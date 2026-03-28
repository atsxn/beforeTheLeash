# scrapers/base_scraper.py
from __future__ import annotations

import time
import random
import logging
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium_stealth import stealth
from fake_useragent import UserAgent

logger = logging.getLogger(__name__)


class BaseScraper:
    """
    Base class for all scrapers.
    Provides a stealth Selenium driver with human-like behaviour
    to reduce bot-detection risk.

    Call init_driver() before using scroll_down / safe_find* / quit.
    """

    def __init__(self):
        self.driver: uc.Chrome | None = None

    # ------------------------------------------------------------------
    # Driver setup
    # ------------------------------------------------------------------

    def init_driver(self, headless: bool = True) -> uc.Chrome:
        ua = UserAgent()
        options = uc.ChromeOptions()

        if headless:
            options.add_argument("--headless=new")

        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--window-size=1920,1080")
        options.add_argument(f"--user-agent={ua.random}")

        self.driver = uc.Chrome(options=options, version_main=145)

        # Apply selenium-stealth patches
        stealth(
            self.driver,
            languages=["th-TH", "th", "en-US", "en"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True,
        )

        logger.info("Driver initialised (headless=%s)", headless)
        return self.driver

    # ------------------------------------------------------------------
    # Helpers — caller must ensure init_driver() was called first
    # ------------------------------------------------------------------

    def random_delay(self, min_sec: float = 1.5, max_sec: float = 4.0) -> None:
        """Mimic human reading/scrolling time."""
        delay = random.uniform(min_sec, max_sec)
        logger.debug("Sleeping %.2fs", delay)
        time.sleep(delay)

    def scroll_down(self, steps: int = 3) -> None:
        """Gradually scroll down to trigger lazy-loaded content."""
        if self.driver is None:
            return
        for _ in range(steps):
            self.driver.execute_script(
                "window.scrollBy(0, window.innerHeight * 0.6);"
            )
            self.random_delay(0.5, 1.5)

    def safe_find(self, by: str, selector: str, timeout: int = 10):
        """Return element or None — never raises."""
        if self.driver is None:
            return None
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, selector))
            )
        except Exception:
            return None

    def safe_find_all(self, by: str, selector: str, timeout: int = 10) -> list:
        """Return list of elements (empty list if not found)."""
        if self.driver is None:
            return []
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, selector))
            )
            return self.driver.find_elements(by, selector)
        except Exception:
            return []

    def quit(self) -> None:
        if self.driver is not None:
            self.driver.quit()
            self.driver = None
            logger.info("Driver closed")