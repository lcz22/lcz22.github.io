"""Shared API serializers."""

from __future__ import annotations

from .models import User
from .repositories.base import QuestRecord
from .schemas import QuestOut


def to_quest_out(record: QuestRecord, user: User | None) -> QuestOut:
    is_admin = bool(user and user.role == "admin")
    is_owner = bool(user and record.owner_id and record.owner_id == user.id)
    return QuestOut(
        id=record.id,
        title=record.title,
        date=record.shot_date.strftime("%Y.%m.%d"),
        iso=record.shot_date.isoformat(),
        time=record.shot_time.strftime("%H:%M"),
        place=record.place,
        feeling=record.feeling,
        stamp=record.stamp,
        category=record.category,  # validated at write time
        image=record.image_url,
        score=round(record.average_score, 1) if record.average_score is not None else None,
        votes=record.total_rating_count,
        my_rating=record.my_rating,
        is_user=not record.is_seed,
        owner_username=record.owner_username,
        is_owner=is_owner,
        can_delete=(is_admin or is_owner) and not record.is_seed,
        status=record.status,
        created_at=record.created_at,
    )
