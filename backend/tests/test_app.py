import json

import pytest

from app import app as flask_app


@pytest.fixture()
def client():
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as c:
        yield c


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.get_json()["ok"] is True


def test_draw_deterministic(client):
    body = json.dumps({"count": 1, "seed": 99})
    r = client.post(
        "/api/draw",
        data=body,
        content_type="application/json",
    )
    assert r.status_code == 200
    data = r.get_json()
    assert "cards" in data and len(data["cards"]) == 1
    r2 = client.post(
        "/api/draw",
        data=body,
        content_type="application/json",
    )
    assert r2.get_json()["cards"] == data["cards"]
