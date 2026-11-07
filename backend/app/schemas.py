"""Pydantic request / response schemas for the HTTP API."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Category = Literal["校园", "下沙", "杭州", "相遇", "深夜"]
Role = Literal["user", "admin"]
QuestStatus = Literal["approved", "pending", "rejected"]


class RegisterIn(BaseModel):
    username: str = Field(min_length=2, max_length=32, description="2–32 位，支持中文、字母、数字、下划线")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    identifier: str = Field(min_length=2, max_length=254, description="用户名或邮箱")
    password: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: EmailStr
    role: Role
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserList(BaseModel):
    items: list[UserOut]
    total: int


class UserUpdate(BaseModel):
    role: Role | None = None
    is_active: bool | None = None


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
    images: list[str] = Field(default_factory=list, description="图集图片 URL，至少包含封面")
    image_count: int = 1
    is_album: bool = False
    motion: str | None = Field(default=None, description="实况照片的可选视频 URL")
    has_motion: bool = False
    score: float | None
    votes: int
    my_rating: int
    is_user: bool
    owner_username: str | None
    is_owner: bool
    can_delete: bool
    status: str
    review_reason: str | None = None
    created_at: datetime


class QuestList(BaseModel):
    items: list[QuestOut]
    total: int
    limit: int
    offset: int


class ProfileStats(BaseModel):
    total: int
    approved: int
    pending: int
    rejected: int
    ratings_received: int
    average_score: float | None


class UserProfileOut(BaseModel):
    username: str
    role: Role
    created_at: datetime
    is_self: bool
    is_admin_viewer: bool
    email: EmailStr | None = None
    stats: ProfileStats
    quests: list[QuestOut]


class QuestStatusUpdate(BaseModel):
    status: QuestStatus
    reason: str | None = Field(default=None, max_length=200)


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
