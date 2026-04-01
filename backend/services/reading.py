"""Build interpretation text from drawn cards and catalog."""

from __future__ import annotations

import json
from pathlib import Path

from .draw import DrawnCard

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_CATALOG_PATH = _DATA_DIR / "major_arcana.json"


def load_catalog() -> list[dict]:
    with open(_CATALOG_PATH, encoding="utf-8") as f:
        return json.load(f)


def _card_by_id(catalog: list[dict], card_id: int) -> dict:
    for c in catalog:
        if c["id"] == card_id:
            return c
    raise KeyError(f"unknown card id {card_id}")


def synthesize(keywords_flat: list[str], count: int) -> str:
    uniq: list[str] = []
    for k in keywords_flat:
        if k not in uniq:
            uniq.append(k)
    top = "、".join(uniq[:5]) if uniq else "当下能量"
    if count == 1:
        return f"综合指引：核心主题围绕「{top}」。保持觉察，让意象在日常中慢慢显影。"
    return (
        f"综合指引：牌阵串联关键词「{top}」。"
        "建议在关系、选择与节奏上寻求平衡，把每张牌的启示视作同一条路上的不同路标。"
    )


def build_reading(drawn: list[DrawnCard], catalog: list[dict] | None = None) -> dict:
    catalog = catalog or load_catalog()
    per_card: list[dict] = []
    all_kw: list[str] = []
    for dc in drawn:
        meta = _card_by_id(catalog, dc.id)
        text = meta["upright"] if dc.upright else meta["reversed"]
        orientation = "正位" if dc.upright else "逆位"
        all_kw.extend(meta.get("keywords") or [])
        per_card.append(
            {
                "id": dc.id,
                "name": meta["name"],
                "name_en": meta["name_en"],
                "upright": dc.upright,
                "orientation": orientation,
                "interpretation": text,
                "keywords": meta.get("keywords", []),
                "hue": meta.get("hue", 0.5),
            }
        )
    return {
        "per_card": per_card,
        "synthesis": synthesize(all_kw, len(drawn)),
        "title": "星幕投影",
    }
