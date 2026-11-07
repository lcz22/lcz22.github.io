"""SQLAlchemy models.

These models are intentionally written against portable SQLAlchemy types so the
same code works with SQLite for local development and PostgreSQL in production.
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


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    shot_date: Mapped[date] = mapped_column(Date, nullable=False)
    shot_time: Mapped[time] = mapped_column(Time, nullable=False)
    place: Mapped[str] = mapped_column(String(120), nullable=False)
    feeling: Mapped[str] = mapped_column(Text, nullable=False)
    stamp: Mapped[str] = mapped_column(String(80), nullable=False, default="PERSONAL ARCHIVE")
    category: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    image_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="approved", index=True)
    is_seed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    seed_rating_sum: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    seed_rating_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    edit_token_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    ratings: Mapped[list["Rating"]] = relationship(
        back_populates="quest",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (
        UniqueConstraint("quest_id", "visitor_id", name="uq_rating_quest_visitor"),
        CheckConstraint("score >= 1 AND score <= 5", name="ck_rating_score_range"),
        Index("ix_ratings_quest_id", "quest_id"),
        Index("ix_ratings_visitor_id", "visitor_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quest_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("quests.id", ondelete="CASCADE"), nullable=False
    )
    visitor_id: Mapped[str] = mapped_column(String(64), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    quest: Mapped[Quest] = relationship(back_populates="ratings")
