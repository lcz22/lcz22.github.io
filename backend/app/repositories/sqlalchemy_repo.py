"""SQLAlchemy implementation of the persistence contract."""

from __future__ import annotations

import hmac
from datetime import timezone

from sqlalchemy import func, literal, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Quest, Rating
from .base import NewQuest, QuestRecord, QuestRepository, RatingSummary, StatsRecord


def _ensure_utc(value):
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _as_record(
    quest: Quest,
    rating_sum: int | float | None,
    rating_count: int | None,
    my_rating: int | None,
) -> QuestRecord:
    return QuestRecord(
        id=quest.id,
        title=quest.title,
        shot_date=quest.shot_date,
        shot_time=quest.shot_time,
        place=quest.place,
        feeling=quest.feeling,
        category=quest.category,
        image_url=quest.image_url,
        image_filename=quest.image_filename,
        status=quest.status,
        is_seed=bool(quest.is_seed),
        seed_rating_sum=float(quest.seed_rating_sum or 0),
        seed_rating_count=int(quest.seed_rating_count or 0),
        rating_sum=int(rating_sum or 0),
        rating_count=int(rating_count or 0),
        my_rating=int(my_rating or 0),
        created_at=_ensure_utc(quest.created_at),
    )


class SqlAlchemyQuestRepository(QuestRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _rating_stats_subquery():
        return (
            select(
                Rating.quest_id.label("quest_id"),
                func.coalesce(func.sum(Rating.score), 0).label("rating_sum"),
                func.count(Rating.id).label("rating_count"),
            )
            .group_by(Rating.quest_id)
            .subquery()
        )

    def _statement(self, *, category: str | None, visitor_id: str | None):
        stats = self._rating_stats_subquery()
        selected = [
            Quest,
            func.coalesce(stats.c.rating_sum, 0).label("rating_sum"),
            func.coalesce(stats.c.rating_count, 0).label("rating_count"),
        ]
        joins = [stats]
        statement = select(*selected).outerjoin(stats, stats.c.quest_id == Quest.id)

        if visitor_id:
            my = (
                select(Rating.quest_id.label("quest_id"), Rating.score.label("score"))
                .where(Rating.visitor_id == visitor_id)
                .subquery()
            )
            joins.append(my)
            statement = statement.add_columns(func.coalesce(my.c.score, 0).label("my_rating"))
            statement = statement.outerjoin(my, my.c.quest_id == Quest.id)
        else:
            statement = statement.add_columns(literal(0).label("my_rating"))

        statement = statement.where(Quest.status == "approved")
        if category:
            statement = statement.where(Quest.category == category)
        return statement

    async def list_quests(
        self,
        *,
        category: str | None,
        limit: int,
        offset: int,
        visitor_id: str | None,
    ) -> tuple[list[QuestRecord], int]:
        count_stmt = select(func.count(Quest.id)).where(Quest.status == "approved")
        if category:
            count_stmt = count_stmt.where(Quest.category == category)
        total = int((await self.session.execute(count_stmt)).scalar_one())

        stmt = (
            self._statement(category=category, visitor_id=visitor_id)
            .order_by(Quest.shot_date.desc(), Quest.shot_time.desc(), Quest.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        rows = (await self.session.execute(stmt)).all()
        return [
            _as_record(row[0], row[1], row[2], row[3])
            for row in rows
        ], total

    async def get_quest(self, quest_id: str, *, visitor_id: str | None = None) -> QuestRecord | None:
        stmt = self._statement(category=None, visitor_id=visitor_id).where(Quest.id == quest_id)
        row = (await self.session.execute(stmt)).first()
        if row is None:
            return None
        return _as_record(row[0], row[1], row[2], row[3])

    async def create_quest(self, data: NewQuest, *, edit_token_hash: str) -> QuestRecord:
        quest = Quest(
            title=data.title,
            shot_date=data.shot_date,
            shot_time=data.shot_time,
            place=data.place,
            feeling=data.feeling,
            category=data.category,
            image_url=data.image_url,
            image_filename=data.image_filename,
            status=data.status,
            is_seed=data.is_seed,
            seed_rating_sum=data.seed_rating_sum,
            seed_rating_count=data.seed_rating_count,
            edit_token_hash=edit_token_hash,
        )
        self.session.add(quest)
        await self.session.commit()
        await self.session.refresh(quest)
        return _as_record(quest, 0, 0, 0)

    async def delete_quest(self, quest_id: str, *, edit_token_hash: str) -> QuestRecord | None:
        quest = await self.session.get(Quest, quest_id)
        if quest is None or not quest.edit_token_hash:
            return None
        if not hmac.compare_digest(quest.edit_token_hash, edit_token_hash):
            return None
        record = _as_record(quest, 0, 0, 0)
        await self.session.delete(quest)
        await self.session.commit()
        return record

    async def _summary(self, quest: Quest, my_rating: int) -> RatingSummary:
        result = await self.session.execute(
            select(
                func.coalesce(func.sum(Rating.score), 0),
                func.count(Rating.id),
            ).where(Rating.quest_id == quest.id)
        )
        rating_sum, rating_count = result.one()
        total_sum = float(quest.seed_rating_sum or 0) + float(rating_sum or 0)
        total_count = int(quest.seed_rating_count or 0) + int(rating_count or 0)
        return RatingSummary(
            average=round(total_sum / total_count, 1) if total_count else None,
            votes=total_count,
            my_rating=my_rating,
        )

    async def upsert_rating(self, quest_id: str, visitor_id: str, score: int) -> RatingSummary | None:
        quest = await self.session.get(Quest, quest_id)
        if quest is None or quest.status != "approved":
            return None

        existing = (
            await self.session.execute(
                select(Rating).where(
                    Rating.quest_id == quest_id,
                    Rating.visitor_id == visitor_id,
                )
            )
        ).scalar_one_or_none()

        if existing is None:
            self.session.add(Rating(quest_id=quest_id, visitor_id=visitor_id, score=score))
        else:
            existing.score = score

        await self.session.commit()
        return await self._summary(quest, score)

    async def delete_rating(self, quest_id: str, visitor_id: str) -> RatingSummary | None:
        quest = await self.session.get(Quest, quest_id)
        if quest is None or quest.status != "approved":
            return None

        existing = (
            await self.session.execute(
                select(Rating).where(
                    Rating.quest_id == quest_id,
                    Rating.visitor_id == visitor_id,
                )
            )
        ).scalar_one_or_none()
        if existing is not None:
            await self.session.delete(existing)
            await self.session.commit()

        return await self._summary(quest, 0)

    async def stats(self) -> StatsRecord:
        total_quests = int(
            (
                await self.session.execute(
                    select(func.count(Quest.id)).where(Quest.status == "approved")
                )
            ).scalar_one()
        )

        rating_counts = (
            await self.session.execute(
                select(
                    func.coalesce(func.sum(Rating.score), 0),
                    func.count(Rating.id),
                )
                .join(Quest, Rating.quest_id == Quest.id)
                .where(Quest.status == "approved")
            )
        ).one()

        seed_totals = (
            await self.session.execute(
                select(
                    func.coalesce(func.sum(Quest.seed_rating_sum), 0),
                    func.coalesce(func.sum(Quest.seed_rating_count), 0),
                ).where(Quest.status == "approved")
            )
        ).one()

        category_rows = (
            await self.session.execute(
                select(Quest.category, func.count(Quest.id))
                .where(Quest.status == "approved")
                .group_by(Quest.category)
            )
        ).all()

        total_sum = float(seed_totals[0] or 0) + float(rating_counts[0] or 0)
        total_votes = int(seed_totals[1] or 0) + int(rating_counts[1] or 0)

        return StatsRecord(
            total_quests=total_quests,
            total_ratings=total_votes,
            average_score=round(total_sum / total_votes, 1) if total_votes else None,
            categories={category: int(count) for category, count in category_rows},
        )
