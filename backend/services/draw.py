"""Random tarot draw without replacement."""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class DrawnCard:
    id: int
    upright: bool

    def to_dict(self) -> dict[str, Any]:
        return {"id": self.id, "upright": self.upright}


def draw_major_arcana(count: int = 1, rng: random.Random | None = None) -> list[DrawnCard]:
    if count < 1 or count > 22:
        raise ValueError("count must be between 1 and 22")
    r = rng or random.Random()
    ids = r.sample(range(22), count)
    return [DrawnCard(id=i, upright=r.choice([True, False])) for i in ids]
