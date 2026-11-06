"""FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import dispose_db, init_db
from .routes import router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    await init_db()
    yield
    await dispose_db()


app = FastAPI(
    title=settings.app_name,
    description=(
        "杭电支线的后端 API。前端只通过 HTTP 访问此服务，不直接连接数据库。"
        "当前使用 SQLite 验证接口；提供 PostgreSQL 后修改 DATABASE_URL 即可切换。"
    ),
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Location"],
)

app.include_router(router, prefix=settings.api_prefix)

# Uploaded images are public. In production this can be replaced by OSS + CDN.
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.upload_dir)), name="uploads")


@app.get("/", tags=["system"])
async def root() -> dict[str, str]:
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "api": settings.api_prefix,
    }
