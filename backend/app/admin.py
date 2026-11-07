"""Admin-only user and content management routes."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from .db import get_session
from .repositories import SqlAlchemyQuestRepository, SqlAlchemyUserRepository
from .repositories.users import UserRepository
from .schemas import QuestList, QuestOut, QuestStatusUpdate, UserList, UserOut, UserUpdate
from .security import AdminUser
from .serializers import to_quest_out

router = APIRouter(prefix="/admin", tags=["admin"])


def get_user_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> UserRepository:
    return SqlAlchemyUserRepository(session)


UserRepo = Annotated[UserRepository, Depends(get_user_repository)]


def quest_repo(session: Annotated[AsyncSession, Depends(get_session)]) -> SqlAlchemyQuestRepository:
    return SqlAlchemyQuestRepository(session)


QuestRepo = Annotated[SqlAlchemyQuestRepository, Depends(quest_repo)]


@router.get("/users", response_model=UserList)
async def list_users(
    admin: AdminUser,
    repository: UserRepo,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> UserList:
    users, total = await repository.list_all(limit=limit, offset=offset)
    return UserList(items=[UserOut.model_validate(user) for user in users], total=total)


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    payload: UserUpdate,
    admin: AdminUser,
    repository: UserRepo,
) -> UserOut:
    user = await repository.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="没有找到这个用户")

    next_role = payload.role if payload.role is not None else user.role
    next_active = payload.is_active if payload.is_active is not None else user.is_active

    if user.id == admin.id and (next_role != "admin" or not next_active):
        raise HTTPException(status_code=400, detail="不能取消自己的管理员权限或停用自己的账号")

    losing_admin = user.role == "admin" and (next_role != "admin" or not next_active)
    if losing_admin and await repository.count_admins() <= 1:
        raise HTTPException(status_code=400, detail="至少需要保留一名可用管理员")

    updated = await repository.update(user, role=payload.role, is_active=payload.is_active)
    return UserOut.model_validate(updated)


@router.get("/quests", response_model=QuestList)
async def list_all_quests(
    admin: AdminUser,
    repository: QuestRepo,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> QuestList:
    items, total = await repository.list_all_quests(limit=limit, offset=offset, admin_id=admin.id)
    return QuestList(
        items=[to_quest_out(item, admin) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.patch("/quests/{quest_id}/status", response_model=QuestOut)
async def update_quest_status(
    quest_id: str,
    payload: QuestStatusUpdate,
    admin: AdminUser,
    repository: QuestRepo,
) -> QuestOut:
    changed = await repository.set_status(quest_id, payload.status)
    if not changed:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    record = await repository.get_quest(quest_id, viewer_id=admin.id, include_unapproved=True)
    if record is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    return to_quest_out(record, admin)
