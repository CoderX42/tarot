import random

from services.draw import draw_major_arcana
from services.reading import build_reading, load_catalog


def test_catalog_has_22():
    c = load_catalog()
    assert len(c) == 22
    assert sorted(x["id"] for x in c) == list(range(22))


def test_build_reading_shape():
    catalog = load_catalog()
    drawn = draw_major_arcana(1, rng=random.Random(1))
    r = build_reading(drawn, catalog)
    assert r["title"] == "星幕投影"
    assert len(r["per_card"]) == 1
    assert r["per_card"][0]["orientation"] in ("正位", "逆位")
    assert "synthesis" in r and len(r["synthesis"]) > 0


def test_build_reading_three():
    drawn = draw_major_arcana(3, rng=random.Random(2))
    r = build_reading(drawn)
    assert len(r["per_card"]) == 3
