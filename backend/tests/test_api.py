from __future__ import annotations

import os
import tempfile
from io import BytesIO
from pathlib import Path

import pytest

# Must be configured before importing the app/settings.
TEST_ROOT = Path(tempfile.mkdtemp(prefix="hdu-sidequests-api-"))
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{(TEST_ROOT / 'test.db').as_posix()}"
os.environ["UPLOAD_DIR"] = str(TEST_ROOT / "uploads")
os.environ["PUBLIC_BASE_URL"] = "http://testserver"
os.environ["AUTO_APPROVE"] = "true"

from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app  # noqa: E402

VISITOR = "test-visitor-0001"


def image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (1400, 1000), (34, 65, 122)).save(buffer, format="JPEG", quality=88)
    return buffer.getvalue()


def test_health_and_categories(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    response = client.get("/api/categories")
    assert response.status_code == 200
    assert "校园" in response.json()["categories"]


def test_full_quest_rating_and_delete_flow(client: TestClient) -> None:
    # Empty archive.
    response = client.get("/api/quests")
    assert response.status_code == 200
    assert response.json()["total"] == 0

    # Create a quest with an image.
    response = client.post(
        "/api/quests",
        data={
            "title": "在图书馆躲雨",
            "shot_date": "2026-11-05",
            "shot_time": "16:05",
            "place": "杭电 · 图书馆",
            "feeling": "雨把窗户洗得很亮，我在书架之间站了很久。",
            "category": "校园",
        },
        files={"image": ("library.jpg", image_bytes(), "image/jpeg")},
    )
    assert response.status_code == 201, response.text
    payload = response.json()
    quest = payload["quest"]
    manage_token = payload["manage_token"]
    quest_id = quest["id"]
    assert quest["title"] == "在图书馆躲雨"
    assert quest["date"] == "2026.11.05"
    assert quest["iso"] == "2026-11-05"
    assert quest["category"] == "校园"
    assert quest["votes"] == 0
    assert quest["score"] is None
    assert quest["image"].startswith("http://testserver/uploads/")
    assert isinstance(manage_token, str) and len(manage_token) > 20

    # Public list and detail.
    response = client.get("/api/quests")
    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["id"] == quest_id

    response = client.get(f"/api/quests/{quest_id}")
    assert response.status_code == 200

    # Static uploaded image is publicly served.
    image_path = quest["image"].replace("http://testserver", "")
    response = client.get(image_path)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"

    # Rating: create, preview in list, update, then clear.
    headers = {"X-Visitor-Id": VISITOR}
    response = client.put(f"/api/quests/{quest_id}/rating", json={"score": 5}, headers=headers)
    assert response.status_code == 200, response.text
    assert response.json() == {"average": 5.0, "votes": 1, "my_rating": 5}

    response = client.get(f"/api/quests/{quest_id}", headers=headers)
    assert response.json()["my_rating"] == 5
    assert response.json()["votes"] == 1

    response = client.put(f"/api/quests/{quest_id}/rating", json={"score": 4}, headers=headers)
    assert response.status_code == 200
    assert response.json() == {"average": 4.0, "votes": 1, "my_rating": 4}

    response = client.delete(f"/api/quests/{quest_id}/rating", headers=headers)
    assert response.status_code == 200
    assert response.json() == {"average": None, "votes": 0, "my_rating": 0}

    # Stats reflect the quest.
    response = client.get("/api/stats")
    assert response.status_code == 200
    assert response.json()["total_quests"] == 1
    assert response.json()["categories"]["校园"] == 1

    # Wrong token must not delete.
    response = client.delete(
        f"/api/quests/{quest_id}",
        headers={"X-Edit-Token": "wrong-token"},
    )
    assert response.status_code == 404

    # Correct token deletes.
    response = client.delete(
        f"/api/quests/{quest_id}",
        headers={"X-Edit-Token": manage_token},
    )
    assert response.status_code == 204

    response = client.get(f"/api/quests/{quest_id}")
    assert response.status_code == 404
    assert client.get("/api/quests").json()["total"] == 0


def test_category_validation_and_invalid_rating(client: TestClient) -> None:
    response = client.get("/api/quests", params={"category": "火星"})
    assert response.status_code == 400

    response = client.put(
        "/api/quests/not-exists/rating",
        json={"score": 3},
        headers={"X-Visitor-Id": VISITOR},
    )
    assert response.status_code == 404

    response = client.put(
        "/api/quests/not-exists/rating",
        json={"score": 9},
        headers={"X-Visitor-Id": VISITOR},
    )
    assert response.status_code == 422


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client
