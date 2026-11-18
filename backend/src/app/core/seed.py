from datetime import UTC, datetime

from app.schemas.fragrance import Fragrance

_now = datetime.now(UTC)
SAMPLE_FRAGRANCES = [
    Fragrance(
        id="1",
        name="Herb Garden",
        category="Herbaceous",
        description="A refreshing fragrance that captures the essence of an aromatic herb garden.",
        image_url="https://example.com/herb_garden.jpg",
        created_at=_now,
        updated_at=_now,
        recipe="2 drops of rosemary. 3 drops of basil."
    ),
    Fragrance(
        id="2",
        name="Citrus Grove",
        category="Citrus",
        description="Bright notes of lemon, bergamot and sweet orange.",
        image_url="https://example.com/citrus_grove.jpg",
        created_at=_now,
        updated_at=_now,
        recipe="2 drops of lemon. 3 drops of orange."
    ),
    Fragrance(
        id="3",
        name="Cedar Smoke",
        category="Woody",
        description="Warm cedarwood wrapped in a soft, smoky haze.",
        image_url="https://example.com/cedar_smoke.jpg",
        created_at=_now,
        updated_at=_now,
        recipe="1 drop of cedar. 3 drops of smoke."
    ),
    Fragrance(
        id="4",
        name="Rose Petal",
        category="Floral",
        description="Fresh-cut roses with a hint of peony.",
        image_url="https://example.com/rose_petal.jpg",
        created_at=_now,
        updated_at=_now,
        recipe="2 drops of rose. 1 drop of grass."
    ),
]
