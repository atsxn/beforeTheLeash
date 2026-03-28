# utils/data_validator.py

import logging
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    is_valid: bool
    errors: list
    cleaned_data: list
    stats: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Dog Food Validator
# ---------------------------------------------------------------------------

class DogFoodValidator:
    """
    Validates and cleans raw dog food records from the scraper.
    Rules:
      - product_name must exist and be non-empty
      - price_thb must be in range (10, 50_000)
      - Strips whitespace / truncates long strings
      - Deduplicates by (product_name, price_thb) within the batch
    """

    PRICE_MIN = 10
    PRICE_MAX = 50_000

    def validate_and_clean(self, raw_data: list) -> ValidationResult:
        errors: list[dict] = []
        cleaned: list[dict] = []
        duplicates: int = 0

        for i, record in enumerate(raw_data):
            row_errors = self._validate_food_record(record, i)
            if row_errors:
                errors.extend(row_errors)
                continue

            # Normalise fields
            record["product_name"] = record["product_name"].strip()[:255]
            if record.get("brand"):
                record["brand"] = record["brand"].strip()[:100]

            if not self._is_duplicate(record, cleaned):
                cleaned.append(record)
            else:
                duplicates += 1  # type: ignore[operator]
                logger.debug("Duplicate skipped: %s", record["product_name"])

        logger.info(
            "DogFood validation: in=%d valid=%d errors=%d dupes=%d",
            len(raw_data), len(cleaned), len(errors), duplicates
        )
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            cleaned_data=cleaned,
            stats={
                "total": len(raw_data),
                "valid": len(cleaned),
                "errors": len(errors),
                "duplicates": duplicates,
            },
        )

    def _validate_food_record(self, record: dict, idx: int) -> list:
        errs: list = []
        name = record.get("product_name", "")
        if not name or not name.strip():
            errs.append(f"Row {idx}: missing product_name")
            return errs   # can't continue without a name

        price = record.get("price_thb")
        if price is None:
            errs.append(f"Row {idx} ({name[:40]}): missing price_thb")
        elif not (self.PRICE_MIN < float(price) < self.PRICE_MAX):
            errs.append(
                f"Row {idx} ({name[:40]}): price {price} out of range "
                f"[{self.PRICE_MIN}, {self.PRICE_MAX}]"
            )
        return errs

    @staticmethod
    def _is_duplicate(record: dict, existing: list) -> bool:
        return any(
            e["product_name"] == record["product_name"]
            and e["price_thb"] == record["price_thb"]
            for e in existing
        )

