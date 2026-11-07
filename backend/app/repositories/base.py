"""Database-facing contracts.

The API layer only depends on these interfaces.  Today the concrete
implementations are SQLAlchemy (SQLite locally, PostgreSQL / MySQL in
production), but another database can be supplied later by implementing them.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime, time


@dataclass(slots=True)
class NewQuest:
    title: str
    shot_date: date
    shot_time: time
    place: str
    feeling: str
    stamp: str
    category: str
    image_url: str
    image_filename: str
    owner_id: str | None = None
    status: str = "pending"
    is_seed: bool = False
    seed_rating_sum: float = 0.0
    seed_rating_count: int = 0
    motion_url: str | None = None
    motion_filename: str | None = None
    motion_mime: str | None = None


@dataclass(slots=True)
class QuestRecord:
    id: str
    title: str
    shot_date: date
    shot_time: time
    place: str
    feeling: str
    stamp: str
    category: str
    image_url: str
    image_filename: str
    motion_url: str | None
    motion_filename: str | None
    status: str
    review_reason: str | None
    reviewed_at: datetime | None
    is_seed: bool
    seed_rating_sum: float
    seed_rating_count: int
    rating_sum: int
    rating_count: int
    my_rating: int
    created_at: datetime
    owner_id: str | None
    owner_username: str | None

    @property
    def total_rating_sum(self) -> float:
        return float(self.seed_rating_sum) + float(self.rating_sum)

    @property
    def total_rating_count(self) -> int:
        return int(self.seed_rating_count) + int(self.rating_count)

    @property
    def average_score(self) -> float | None:
        if not self.total_rating_count:
            return None
        return self.total_rating_sum / self.total_rating_count


@dataclass(slots=True)
class RatingSummary:
    average: float | None
    votes: int
    my_rating: int


@dataclass(slots=True)
class StatsRecord:
    total_quests: int
    total_ratings: int
    average_score: float | None
    categories: dict[str, int]


class QuestRepository(ABC):
    """All persistence operations used by the quest / rating API."""

    @abstractmethod
    async def list_quests(
        self,
        *,
        category: str | None,
        limit: int,
        offset: int,
        viewer_id: str | None,
    ) -> tuple[list[QuestRecord], int]:
        raise NotImplementedError

    @abstractmethod
    async def list_all_quests(
        self,
        *,
        limit: int,
        offset: int,
        admin_id: str,
        status: str | None = None,
    ) -> tuple[list[QuestRecord], int]:
        raise NotImplementedError

    @abstractmethod
    async def list_user_quests(
        self,
        *,
        owner_id: str,
        viewer_id: str | None,
        include_unpublished: bool,
        limit: int = 200,
        offset: int = 0,
    ) -> tuple[list[QuestRecord], int]:
        raise NotImplementedError

    @abstractmethod
    async def get_quest(
        self,
        quest_id: str,
        *,
        viewer_id: str | None = None,
        include_unapproved: bool = False,
    ) -> QuestRecord | None:
        raise NotImplementedError

    @abstractmethod
    async def create_quest(self, data: NewQuest) -> QuestRecord:
        raise NotImplementedError

    @abstractmethod
    async def delete_quest(self, quest_id: str) -> QuestRecord | None:
        raise NotImplementedError

    @abstractmethod
    async def set_status(
        self,
        quest_id: str,
        status: str,
        *,
        reason: str | None = None,
    ) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def upsert_rating(self, quest_id: str, user_id: str, score: int) -> RatingSummary | None:
        raise NotImplementedError

    @abstractmethod
    async def delete_rating(self, quest_id: str, user_id: str) -> RatingSummary | None:
        raise NotImplementedError

    @abstractmethod
    async def stats(self) -> StatsRecord:
        raise NotImplementedError
