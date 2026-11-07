"""Pydantic response / request schemas for the HTTP API."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Category = Literal["校园", "下沙", "杭州", "相遇", "深夜"]


class RatingUpdate(BaseModel):
    score: int = Field(ge=1, le=5, description="1–5 分")


class RatingOut(BaseModel):
    average: float | None
    votes: int
    my_rating: int


class QuestOut(BaseModel):
    id: str
    title: str
    date: str = Field(description="展示用日期，例如 2026.11.02")
    iso: str = Field(description="ISO 日期，例如 2026-11-02")
    time: str
    place: str
    feeling: str
    stamp: str
    category: Category
    image: str = Field(description="可直接放进 <img src> 的图片 URL")
    score: float | None
    votes: int
    my_rating: int
    is_user: bool
    status: str
    created_at: datetime


class QuestCreated(BaseModel):
    quest: QuestOut
    manage_token: str = Field(description="删除凭证，仅在创建时返回一次，前端需妥善保存")


class QuestList(BaseModel):
    items: list[QuestOut]
    total: int
    limit: int
    offset: int


class StatsOut(BaseModel):
    total_quests: int
    total_ratings: int
    average_score: float | None
    categories: dict[str, int]


class HealthOut(BaseModel):
    status: str
    service: str
    version: str


class CategoriesOut(BaseModel):
    categories: list[str]
