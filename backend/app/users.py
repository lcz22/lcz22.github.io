"""Public user profile route."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .db import get_session
from .repositories import SqlAlchemyQuestRepository, SqlAlchemyUserRepository
from .repositories.users import UserRepository
from .schemas import ProfileStats, UserProfileOut
from .security import OptionalUser
from .serializers import to_quest_out

router = APIRouter(prefix="/users", tags=["users"])


def get_user_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> UserRepository:
    return SqlAlchemyUserRepository(session)


def get_quest_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> SqlAlchemyQuestRepository:
    return SqlAlchemyQuestRepository(session)


UserRepo = Annotated[UserRepository, Depends(get_user_repository)]
QuestRepo = Annotated[SqlAlchemyQuestRepository, Depends(get_quest_repository)]


@router.get("/{username}", response_model=UserProfileOut)
async def get_profile(
    username: str,
    viewer: OptionalUser,
    users: UserRepo,
    quests: QuestRepo,
) -> UserProfileOut:
    target = await users.get_by_identifier(username)
    if target is None or target.username.lower() != username.lower():
        raise HTTPException(status_code=404, detail="没有找到这个用户")

    is_self = bool(viewer and viewer.id == target.id)
    is_admin = bool(viewer and viewer.role == "admin")
    include_unpublished = is_self or is_admin

    items, total = await quests.list_user_quests(
        owner_id=target.id,
        viewer_id=viewer.id if viewer else None,
        include_unpublished=include_unpublished,
    )

    approved = [item for item in items if item.status == "approved"]
    rating_sum = sum(item.total_rating_sum for item in approved)
    rating_count = sum(item.total_rating_count for item in approved)
    stats = ProfileStats(
        total=total,
        approved=sum(1 for item in items if item.status == "approved"),
        pending=sum(1 for item in items if item.status == "pending"),
        rejected=sum(1 for item in items if item.status == "rejected"),
        ratings_received=rating_count,
        average_score=round(rating_sum / rating_count, 1) if rating_count else None,
    )

    return UserProfileOut(
        username=target.username,
        role=target.role,
        created_at=target.created_at,
        is_self=is_self,
        is_admin_viewer=is_admin,
        email=target.email if (is_self or is_admin) else None,
        stats=stats,
        quests=[to_quest_out(item, viewer) for item in items],
    )
