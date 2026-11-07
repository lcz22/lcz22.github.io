"""Application configuration, loaded from environment variables / .env."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

CATEGORIES: tuple[str, ...] = ("校园", "下沙", "杭州", "相遇", "深夜")


def _split_origins(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    app_name: str = "杭电支线 API"
    app_version: str = "0.1.0"
    api_prefix: str = "/api"
    database_url: str = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{(BASE_DIR / 'hdu_sidequests.db').as_posix()}",
    )
    upload_dir: Path = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
    public_base_url: str = os.getenv("PUBLIC_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
    frontend_base_url: str = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:4173").rstrip("/")
    cors_origins: tuple[str, ...] = _split_origins(
        os.getenv(
            "CORS_ORIGINS",
            "http://127.0.0.1:4173,http://localhost:4173,"
            "http://127.0.0.1:8000,http://localhost:8000,"
            "https://lcz22.github.io",
        )
    )
    max_upload_bytes: int = int(os.getenv("MAX_UPLOAD_BYTES", str(20 * 1024 * 1024)))
    max_image_side: int = int(os.getenv("MAX_IMAGE_SIDE", "1800"))
    jpeg_quality: int = int(os.getenv("JPEG_QUALITY", "84"))
    auto_approve: bool = os.getenv("AUTO_APPROVE", "true").lower() in {"1", "true", "yes", "on"}


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
