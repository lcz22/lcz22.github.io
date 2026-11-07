"""SQLAlchemy models.

These models are intentionally written against portable SQLAlchemy types so the
same code works with SQLite for local development and PostgreSQL / MySQL in
production.
"""

from __future__ import annotations

from datetime import date, datetime, time, timezone
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    username: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(16), nullable=False, default="user", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    quests: Mapped[list["Quest"]] = relationship(back_populates="owner")
    ratings: Mapped[list["Rating"]] = relationship(back_populates="user")


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    owner_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    shot_date: Mapped[date] = mapped_column(Date, nullable=False)
    shot_time: Mapped[time] = mapped_column(Time, nullable=False)
    place: Mapped[str] = mapped_column(String(120), nullable=False)
    feeling: Mapped[str] = mapped_column(Text, nullable=False)
    stamp: Mapped[str] = mapped_column(String(80), nullable=False, default="PERSONAL ARCHIVE")
    category: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    image_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    images_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    motion_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    motion_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    motion_mime: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    review_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_seed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    seed_rating_sum: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    seed_rating_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    owner: Mapped[User | None] = relationship(back_populates="quests")
    ratings: Mapped[list["Rating"]] = relationship(
        back_populates="quest",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (
        UniqueConstraint("quest_id", "user_id", name="uq_rating_quest_user"),
        CheckConstraint("score >= 1 AND score <= 5", name="ck_rating_score_range"),
        Index("ix_ratings_quest_id", "quest_id"),
        Index("ix_ratings_user_id", "user_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quest_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("quests.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    quest: Mapped[Quest] = relationship(back_populates="ratings")
    user: Mapped[User] = relationship(back_populates="ratings")
