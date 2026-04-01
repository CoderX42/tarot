"""Stellar Tarot API."""

from __future__ import annotations

import os
import random

from flask import Flask, jsonify, request
from flask_cors import CORS

from services.draw import draw_major_arcana
from services.reading import build_reading, load_catalog

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.get("/api/health")
def health():
    return jsonify({"ok": True})


@app.get("/api/cards")
def cards():
    return jsonify({"cards": load_catalog()})


@app.post("/api/draw")
def draw():
    data = request.get_json(silent=True) or {}
    count = int(data.get("count", 1))
    spread = data.get("spread", "single")
    if spread == "three":
        count = 3
    question = (data.get("question") or "").strip()
    seed = data.get("seed")
    rng = random.Random(int(seed)) if seed is not None else None
    try:
        drawn = draw_major_arcana(count=count, rng=rng)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    catalog = load_catalog()
    reading = build_reading(drawn, catalog)
    out_cards = []
    for dc, pc in zip(drawn, reading["per_card"], strict=True):
        out_cards.append(
            {
                "id": dc.id,
                "upright": dc.upright,
                "name": pc["name"],
                "name_en": pc["name_en"],
                "keywords": pc["keywords"],
                "hue": pc["hue"],
            }
        )
    return jsonify(
        {
            "question": question,
            "cards": out_cards,
            "per_card": reading["per_card"],
            "synthesis": reading["synthesis"],
            "title": reading["title"],
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=True)
