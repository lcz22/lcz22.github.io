"""Database-facing contracts.

The API layer only depends on ``QuestRepository``.  Today the concrete
implementation is SQLAlchemy (SQLite locally, PostgreSQL in production), but a
different database can be supplied later by implementing this interface.
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
    category: str
    image_url: str
    image_filename: str
    status: str = "approved"
    is_seed: bool = False
    seed_rating_sum: float = 0.0
    seed_rating_count: int = 0


@dataclass(slots=True)
class QuestRecord:
    id: str
    title: str
    shot_date: date
    shot_time: time
    place: str
    feeling: str
    category: str
    image_url: str
    image_filename: str
    status: str
    is_seed: bool
    seed_rating_sum: float
    seed_rating_count: int
    rating_sum: int
    rating_count: int
    my_rating: int
    created_at: datetime

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
    """All persistence operations used by the HTTP API."""

    @abstractmethod
    async def list_quests(
        self,
        *,
        category: str | None,
        limit: int,
        offset: int,
        visitor_id: str | None,
    ) -> tuple[list[QuestRecord], int]:
        raise NotImplementedError

    @abstractmethod
    async def get_quest(self, quest_id: str, *, visitor_id: str | None = None) -> QuestRecord | None:
        raise NotImplementedError

    @abstractmethod
    async def create_quest(self, data: NewQuest, *, edit_token_hash: str) -> QuestRecord:
        raise NotImplementedError

    @abstractmethod
    async def delete_quest(self, quest_id: str, *, edit_token_hash: str) -> QuestRecord | None:
        raise NotImplementedError

    @abstractmethod
    async def upsert_rating(self, quest_id: str, visitor_id: str, score: int) -> RatingSummary | None:
        raise NotImplementedError

    @abstractmethod
    async def delete_rating(self, quest_id: str, visitor_id: str) -> RatingSummary | None:
        raise NotImplementedError

    @abstractmethod
    async def stats(self) -> StatsRecord:
        raise NotImplementedError
