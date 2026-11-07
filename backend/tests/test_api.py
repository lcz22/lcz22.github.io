from __future__ import annotations

import os
import sqlite3
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
os.environ["JWT_SECRET"] = "test-secret-that-is-long-enough-for-hs256"

from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app  # noqa: E402


def image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (1400, 1000), (34, 65, 122)).save(buffer, format="JPEG", quality=88)
    return buffer.getvalue()


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register(client: TestClient, username: str, email: str) -> dict:
    response = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": "password-123"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def create_quest(client: TestClient, token: str, title: str = "在图书馆躲雨") -> dict:
    response = client.post(
        "/api/quests",
        headers=auth(token),
        data={
            "title": title,
            "shot_date": "2026-11-05",
            "shot_time": "16:05",
            "place": "杭电 · 图书馆",
            "feeling": "雨把窗户洗得很亮，我在书架之间站了很久。",
            "category": "校园",
        },
        files={"image": ("library.jpg", image_bytes(), "image/jpeg")},
    )
    assert response.status_code == 201, response.text
    return response.json()


def promote_to_admin(username: str) -> None:
    connection = sqlite3.connect(TEST_ROOT / "test.db")
    try:
        connection.execute("UPDATE users SET role = 'admin' WHERE username = ?", (username,))
        connection.commit()
    finally:
        connection.close()


def test_health_and_categories(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    response = client.get("/api/categories")
    assert response.status_code == 200
    assert "校园" in response.json()["categories"]


def test_auth_register_login_and_permissions(client: TestClient) -> None:
    alice = register(client, "alice", "alice@example.com")
    token = alice["access_token"]
    assert alice["user"]["role"] == "user"

    response = client.get("/api/auth/me", headers=auth(token))
    assert response.status_code == 200
    assert response.json()["username"] == "alice"

    response = client.post(
        "/api/auth/register",
        json={"username": "alice", "email": "other@example.com", "password": "password-123"},
    )
    assert response.status_code == 409

    response = client.post(
        "/api/auth/login",
        json={"identifier": "alice@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401

    response = client.post(
        "/api/auth/login",
        json={"identifier": "alice", "password": "password-123"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["username"] == "alice"

    # Guests can browse but cannot create.
    response = client.get("/api/quests")
    assert response.status_code == 200
    assert response.json()["total"] == 0

    response = client.post(
        "/api/quests",
        data={
            "title": "guest",
            "shot_date": "2026-11-05",
            "shot_time": "16:05",
            "category": "校园",
        },
        files={"image": ("library.jpg", image_bytes(), "image/jpeg")},
    )
    assert response.status_code == 401

    quest = create_quest(client, token)
    quest_id = quest["id"]
    assert quest["owner_username"] == "alice"
    assert quest["is_owner"] is True
    assert quest["can_delete"] is True

    response = client.put(
        f"/api/quests/{quest_id}/rating",
        json={"score": 5},
        headers=auth(token),
    )
    assert response.status_code == 200
    assert response.json() == {"average": 5.0, "votes": 1, "my_rating": 5}

    guest_detail = client.get(f"/api/quests/{quest_id}")
    assert guest_detail.status_code == 200
    assert guest_detail.json()["my_rating"] == 0
    assert guest_detail.json()["can_delete"] is False

    alice_detail = client.get(f"/api/quests/{quest_id}", headers=auth(token))
    assert alice_detail.json()["my_rating"] == 5

    bob = register(client, "bob", "bob@example.com")
    response = client.delete(f"/api/quests/{quest_id}", headers=auth(bob["access_token"]))
    assert response.status_code == 403

    response = client.delete(f"/api/quests/{quest_id}", headers=auth(token))
    assert response.status_code == 204
    assert client.get(f"/api/quests/{quest_id}").status_code == 404


def test_admin_management_and_moderation(client: TestClient) -> None:
    owner = register(client, "carol", "carol@example.com")
    admin = register(client, "dave", "dave@example.com")
    promote_to_admin("dave")

    response = client.get("/api/admin/users", headers=auth(admin["access_token"]))
    assert response.status_code == 200, response.text
    assert any(item["username"] == "carol" for item in response.json()["items"])

    response = client.get("/api/admin/users", headers=auth(owner["access_token"]))
    assert response.status_code == 403

    quest = create_quest(client, owner["access_token"], title="待审核的支线")
    quest_id = quest["id"]

    response = client.patch(
        f"/api/admin/quests/{quest_id}/status",
        json={"status": "pending"},
        headers=auth(admin["access_token"]),
    )
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "pending"

    guest_list = client.get("/api/quests").json()
    assert all(item["id"] != quest_id for item in guest_list["items"])
    admin_list = client.get("/api/admin/quests", headers=auth(admin["access_token"]))
    assert admin_list.status_code == 200
    assert any(item["id"] == quest_id for item in admin_list.json()["items"])

    response = client.patch(
        f"/api/admin/quests/{quest_id}/status",
        json={"status": "approved"},
        headers=auth(admin["access_token"]),
    )
    assert response.status_code == 200
    assert client.get(f"/api/quests/{quest_id}").status_code == 200

    response = client.delete(f"/api/quests/{quest_id}", headers=auth(admin["access_token"]))
    assert response.status_code == 204

    # The last admin cannot demote themselves.
    response = client.patch(
        f"/api/admin/users/{admin['user']['id']}",
        json={"role": "user"},
        headers=auth(admin["access_token"]),
    )
    assert response.status_code == 400


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client
