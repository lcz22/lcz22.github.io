from __future__ import annotations

import os
import sqlite3
import subprocess
import tempfile
from functools import lru_cache
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
from pillow_heif import from_pillow  # noqa: E402
import imageio_ffmpeg  # noqa: E402

from app.main import app  # noqa: E402


def image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (1400, 1000), (34, 65, 122)).save(buffer, format="JPEG", quality=88)
    return buffer.getvalue()


def heic_bytes() -> bytes:
    buffer = BytesIO()
    from_pillow(Image.new("RGB", (1200, 900), (40, 90, 150))).save(buffer, quality=80)
    return buffer.getvalue()


@lru_cache(maxsize=1)
def motion_bytes() -> bytes:
    target = TEST_ROOT / "motion-source.mp4"
    subprocess.run(
        [
            imageio_ffmpeg.get_ffmpeg_exe(),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=blue:s=320x240:d=1",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(target),
        ],
        check=True,
    )
    return target.read_bytes()


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register(client: TestClient, username: str, email: str) -> dict:
    response = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": "password-123"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def create_quest(
    client: TestClient,
    token: str,
    title: str = "在图书馆躲雨",
    *,
    image: bytes | None = None,
    image_name: str = "library.jpg",
    image_type: str = "image/jpeg",
    motion: bool = False,
) -> dict:
    files = {"image": (image_name, image or image_bytes(), image_type)}
    if motion:
        files["motion"] = ("live.mov", motion_bytes(), "application/octet-stream")
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
        files=files,
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
    owner_list = client.get("/api/quests", headers=auth(owner["access_token"]))
    assert any(item["id"] == quest_id and item["status"] == "pending" for item in owner_list.json()["items"])

    response = client.patch(
        f"/api/admin/quests/{quest_id}/status",
        json={"status": "rejected", "reason": "请补充更清楚的校园地点"},
        headers=auth(admin["access_token"]),
    )
    assert response.status_code == 200
    owner_detail = client.get(f"/api/quests/{quest_id}", headers=auth(owner["access_token"]))
    assert owner_detail.status_code == 200
    assert owner_detail.json()["review_reason"] == "请补充更清楚的校园地点"
    assert client.get(f"/api/quests/{quest_id}").status_code == 404

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

    # Disabled users' approved posts must disappear from public lists and detail.
    henry = register(client, "henry", "henry@example.com")
    henry_quest = create_quest(client, henry["access_token"], title="停用后的投稿")
    response = client.patch(
        f"/api/admin/users/{henry['user']['id']}",
        json={"is_active": False},
        headers=auth(admin["access_token"]),
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False

    public_list = client.get("/api/quests").json()
    assert all(item["id"] != henry_quest["id"] for item in public_list["items"])
    assert client.get(f"/api/quests/{henry_quest['id']}").status_code == 404
    assert client.get("/api/users/henry").status_code == 404
    assert client.get("/api/users/henry", headers=auth(admin["access_token"])).status_code == 200
    admin_quests = client.get(
        "/api/admin/quests",
        params={"status": "approved"},
        headers=auth(admin["access_token"]),
    )
    assert any(item["id"] == henry_quest["id"] for item in admin_quests.json()["items"])

    response = client.patch(
        f"/api/admin/users/{henry['user']['id']}",
        json={"is_active": True},
        headers=auth(admin["access_token"]),
    )
    assert response.status_code == 200
    assert client.get(f"/api/quests/{henry_quest['id']}").status_code == 200
    assert client.delete(f"/api/quests/{henry_quest['id']}", headers=auth(admin["access_token"])).status_code == 204

    # The last admin cannot demote themselves.
    response = client.patch(
        f"/api/admin/users/{admin['user']['id']}",
        json={"role": "user"},
        headers=auth(admin["access_token"]),
    )
    assert response.status_code == 400


def test_heic_and_motion_upload(client: TestClient) -> None:
    user = register(client, "erin", "erin@example.com")
    quest = create_quest(
        client,
        user["access_token"],
        title="实况里的晚霞",
        image=heic_bytes(),
        image_name="live.heic",
        image_type="application/octet-stream",
        motion=True,
    )
    assert quest["has_motion"] is True
    assert quest["motion"].startswith("http://testserver/uploads/")
    assert quest["image"].startswith("http://testserver/uploads/")

    image_response = client.get(quest["image"].replace("http://testserver", ""))
    assert image_response.status_code == 200
    assert image_response.headers["content-type"] == "image/jpeg"

    motion_response = client.get(quest["motion"].replace("http://testserver", ""))
    assert motion_response.status_code == 200
    assert motion_response.headers["content-type"] == "video/mp4"

    response = client.delete(f"/api/quests/{quest['id']}", headers=auth(user["access_token"]))
    assert response.status_code == 204


def test_album_upload(client: TestClient) -> None:
    user = register(client, "iris", "iris@example.com")
    response = client.post(
        "/api/quests",
        headers=auth(user["access_token"]),
        data={
            "title": "图集测试",
            "shot_date": "2026-11-07",
            "shot_time": "22:40",
            "category": "校园",
        },
        files=[
            ("images", ("one.jpg", image_bytes(), "image/jpeg")),
            ("images", ("two.jpg", image_bytes(), "image/jpeg")),
            ("images", ("three.jpg", image_bytes(), "image/jpeg")),
        ],
    )
    assert response.status_code == 201, response.text
    payload = response.json()
    assert payload["is_album"] is True
    assert payload["image_count"] == 3
    assert len(payload["images"]) == 3
    for url in payload["images"]:
        assert client.get(url.replace("http://testserver", "")).status_code == 200
    assert client.delete(f"/api/quests/{payload['id']}", headers=auth(user["access_token"])).status_code == 204


def test_public_profile(client: TestClient) -> None:
    user = register(client, "gina", "gina@example.com")
    quest = create_quest(client, user["access_token"], title="主页里的支线")

    public = client.get("/api/users/gina")
    assert public.status_code == 200, public.text
    payload = public.json()
    assert payload["username"] == "gina"
    assert payload["is_self"] is False
    assert payload["email"] is None
    assert payload["stats"]["total"] == 1
    assert payload["stats"]["approved"] == 1
    assert payload["quests"][0]["id"] == quest["id"]

    own = client.get("/api/users/gina", headers=auth(user["access_token"]))
    assert own.status_code == 200
    assert own.json()["is_self"] is True
    assert own.json()["email"] == "gina@example.com"

    assert client.get("/api/users/not-a-user").status_code == 404
    assert client.delete(f"/api/quests/{quest['id']}", headers=auth(user["access_token"])).status_code == 204


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client
