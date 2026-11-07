"""HTTP routes for 杭电支线."""

from __future__ import annotations

import hashlib
import re
import secrets
from datetime import date, time
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from .config import CATEGORIES, settings
from .db import get_session
from .repositories import NewQuest, QuestRecord, QuestRepository, SqlAlchemyQuestRepository
from .schemas import (
    CategoriesOut,
    HealthOut,
    QuestCreated,
    QuestList,
    QuestOut,
    RatingOut,
    RatingUpdate,
    StatsOut,
)
from .storage import ImageStorage, InvalidImageError, get_storage

router = APIRouter()

VISITOR_PATTERN = re.compile(r"^[A-Za-z0-9_-]{8,64}$")
MAX_TITLE = 32
MAX_PLACE = 40
MAX_FEELING = 220


def get_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> QuestRepository:
    return SqlAlchemyQuestRepository(session)


RepositoryDep = Annotated[QuestRepository, Depends(get_repository)]
StorageDep = Annotated[ImageStorage, Depends(get_storage)]


def normalize_visitor(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if not VISITOR_PATTERN.fullmatch(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Visitor-Id 必须是 8–64 位字母、数字、下划线或短横线",
        )
    return value


def required_visitor(value: str | None) -> str:
    normalized = normalize_visitor(value)
    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="缺少 X-Visitor-Id",
        )
    return normalized


def to_out(record: QuestRecord) -> QuestOut:
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
        status=record.status,
        created_at=record.created_at,
    )


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.get("/health", response_model=HealthOut, tags=["system"])
async def health() -> HealthOut:
    return HealthOut(status="ok", service=settings.app_name, version=settings.app_version)


@router.get("/categories", response_model=CategoriesOut, tags=["public"])
async def categories() -> CategoriesOut:
    return CategoriesOut(categories=list(CATEGORIES))


@router.get("/stats", response_model=StatsOut, tags=["public"])
async def stats(repository: RepositoryDep) -> StatsOut:
    record = await repository.stats()
    return StatsOut(
        total_quests=record.total_quests,
        total_ratings=record.total_ratings,
        average_score=record.average_score,
        categories=record.categories,
    )


@router.get("/quests", response_model=QuestList, tags=["public"])
async def list_quests(
    repository: RepositoryDep,
    category: Annotated[str | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    x_visitor_id: Annotated[str | None, Header(alias="X-Visitor-Id")] = None,
) -> QuestList:
    if category is not None and category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="未知的分类")
    visitor_id = normalize_visitor(x_visitor_id)
    items, total = await repository.list_quests(
        category=category,
        limit=limit,
        offset=offset,
        visitor_id=visitor_id,
    )
    return QuestList(items=[to_out(item) for item in items], total=total, limit=limit, offset=offset)


@router.get("/quests/{quest_id}", response_model=QuestOut, tags=["public"])
async def get_quest(
    quest_id: str,
    repository: RepositoryDep,
    x_visitor_id: Annotated[str | None, Header(alias="X-Visitor-Id")] = None,
) -> QuestOut:
    visitor_id = normalize_visitor(x_visitor_id)
    record = await repository.get_quest(quest_id, visitor_id=visitor_id)
    if record is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    return to_out(record)


@router.post(
    "/quests",
    response_model=QuestCreated,
    status_code=status.HTTP_201_CREATED,
    tags=["submission"],
)
async def create_quest(
    repository: RepositoryDep,
    storage: StorageDep,
    title: Annotated[str, Form(min_length=1, max_length=MAX_TITLE)],
    shot_date: Annotated[date, Form()],
    shot_time: Annotated[time, Form()],
    place: Annotated[str, Form(max_length=MAX_PLACE)] = "",
    feeling: Annotated[str, Form(max_length=MAX_FEELING)] = "",
    category: Annotated[str, Form()] = "校园",
    image: UploadFile = File(...),
) -> QuestCreated:
    clean_title = title.strip()
    if not clean_title:
        raise HTTPException(status_code=422, detail="标题不能为空")
    if category not in CATEGORIES:
        raise HTTPException(status_code=422, detail="未知的分类")

    try:
        stored = await storage.save(image)
    except InvalidImageError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    manage_token = secrets.token_urlsafe(24)
    data = NewQuest(
        title=clean_title,
        shot_date=shot_date,
        shot_time=shot_time,
        place=place.strip() or "杭电 · 未命名地点",
        feeling=feeling.strip() or "有些时刻来不及描述，只能先把它留下来。",
        stamp=f"PERSONAL ARCHIVE · {shot_date.strftime('%Y.%m.%d')}",
        category=category,
        image_url=stored.url,
        image_filename=stored.filename,
        status="approved" if settings.auto_approve else "pending",
    )
    try:
        record = await repository.create_quest(data, edit_token_hash=token_hash(manage_token))
    except Exception:
        storage.delete(stored.filename)
        raise

    return QuestCreated(quest=to_out(record), manage_token=manage_token)


@router.delete("/quests/{quest_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["submission"])
async def delete_quest(
    quest_id: str,
    repository: RepositoryDep,
    storage: StorageDep,
    x_edit_token: Annotated[str | None, Header(alias="X-Edit-Token")] = None,
) -> Response:
    if not x_edit_token:
        raise HTTPException(status_code=400, detail="缺少 X-Edit-Token")
    record = await repository.delete_quest(quest_id, edit_token_hash=token_hash(x_edit_token))
    if record is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线，或删除凭证不正确")
    storage.delete(record.image_filename)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/quests/{quest_id}/rating", response_model=RatingOut, tags=["rating"])
async def upsert_rating(
    quest_id: str,
    payload: RatingUpdate,
    repository: RepositoryDep,
    x_visitor_id: Annotated[str | None, Header(alias="X-Visitor-Id")] = None,
) -> RatingOut:
    visitor_id = required_visitor(x_visitor_id)
    summary = await repository.upsert_rating(quest_id, visitor_id, payload.score)
    if summary is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    return RatingOut(average=summary.average, votes=summary.votes, my_rating=summary.my_rating)


@router.delete("/quests/{quest_id}/rating", response_model=RatingOut, tags=["rating"])
async def delete_rating(
    quest_id: str,
    repository: RepositoryDep,
    x_visitor_id: Annotated[str | None, Header(alias="X-Visitor-Id")] = None,
) -> RatingOut:
    visitor_id = required_visitor(x_visitor_id)
    summary = await repository.delete_rating(quest_id, visitor_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    return RatingOut(average=summary.average, votes=summary.votes, my_rating=summary.my_rating)
