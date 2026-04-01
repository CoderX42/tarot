import random

import pytest

from services.draw import draw_major_arcana


def test_draw_count_and_unique():
    rng = random.Random(42)
    d = draw_major_arcana(3, rng=rng)
    assert len(d) == 3
    assert len({c.id for c in d}) == 3
    assert all(0 <= c.id < 22 for c in d)


def test_draw_reproducible_with_seed():
    a = draw_major_arcana(5, rng=random.Random(7))
    b = draw_major_arcana(5, rng=random.Random(7))
    assert [c.id for c in a] == [c.id for c in b]
    assert [c.upright for c in a] == [c.upright for c in b]


def test_draw_invalid_count():
    with pytest.raises(ValueError):
        draw_major_arcana(0)
    with pytest.raises(ValueError):
        draw_major_arcana(23)
