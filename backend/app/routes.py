"""HTTP routes for 杭电支线."""

from __future__ import annotations

from datetime import date, time
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from .config import CATEGORIES, settings
from .db import get_session
from .repositories import NewQuest, QuestRepository, SqlAlchemyQuestRepository
from .schemas import (
    CategoriesOut,
    HealthOut,
    QuestList,
    QuestOut,
    RatingOut,
    RatingUpdate,
    StatsOut,
)
from .security import CurrentUser, OptionalUser
from .serializers import to_quest_out
from .storage import (
    ImageStorage,
    InvalidImageError,
    InvalidMotionError,
    get_storage,
)

router = APIRouter()

MAX_TITLE = 32
MAX_PLACE = 40
MAX_FEELING = 220


def get_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> QuestRepository:
    return SqlAlchemyQuestRepository(session)


RepositoryDep = Annotated[QuestRepository, Depends(get_repository)]
StorageDep = Annotated[ImageStorage, Depends(get_storage)]


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
    user: OptionalUser,
    category: Annotated[str | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> QuestList:
    if category is not None and category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="未知的分类")
    items, total = await repository.list_quests(
        category=category,
        limit=limit,
        offset=offset,
        viewer_id=user.id if user else None,
    )
    return QuestList(
        items=[to_quest_out(item, user) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/quests/{quest_id}", response_model=QuestOut, tags=["public"])
async def get_quest(
    quest_id: str,
    repository: RepositoryDep,
    user: OptionalUser,
) -> QuestOut:
    record = await repository.get_quest(
        quest_id,
        viewer_id=user.id if user else None,
        include_unapproved=True,
    )
    if record is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    if record.status != "approved" and not (
        user and (user.role == "admin" or record.owner_id == user.id)
    ):
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    return to_quest_out(record, user)


@router.post(
    "/quests",
    response_model=QuestOut,
    status_code=status.HTTP_201_CREATED,
    tags=["submission"],
)
async def create_quest(
    repository: RepositoryDep,
    storage: StorageDep,
    user: CurrentUser,
    title: Annotated[str, Form(min_length=1, max_length=MAX_TITLE)],
    shot_date: Annotated[date, Form()],
    shot_time: Annotated[time, Form()],
    place: Annotated[str, Form(max_length=MAX_PLACE)] = "",
    feeling: Annotated[str, Form(max_length=MAX_FEELING)] = "",
    category: Annotated[str, Form()] = "校园",
    image: UploadFile = File(...),
    motion: UploadFile | None = File(None),
) -> QuestOut:
    clean_title = title.strip()
    if not clean_title:
        raise HTTPException(status_code=422, detail="标题不能为空")
    if category not in CATEGORIES:
        raise HTTPException(status_code=422, detail="未知的分类")

    try:
        stored = await storage.save(image)
    except InvalidImageError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    stored_motion = None
    if motion is not None:
        try:
            stored_motion = await storage.save_motion(motion)
        except InvalidMotionError as exc:
            storage.delete(stored.filename)
            raise HTTPException(status_code=422, detail=str(exc)) from exc

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
        motion_url=stored_motion.url if stored_motion else None,
        motion_filename=stored_motion.filename if stored_motion else None,
        motion_mime=stored_motion.mime if stored_motion else None,
        owner_id=user.id,
        status="approved" if settings.auto_approve else "pending",
    )
    try:
        record = await repository.create_quest(data)
    except Exception:
        storage.delete(stored.filename)
        if stored_motion:
            storage.delete(stored_motion.filename)
        raise

    if record.owner_username is None:
        record = await repository.get_quest(
            record.id,
            viewer_id=user.id,
            include_unapproved=True,
        ) or record

    return to_quest_out(record, user)


@router.delete("/quests/{quest_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["submission"])
async def delete_quest(
    quest_id: str,
    repository: RepositoryDep,
    storage: StorageDep,
    user: CurrentUser,
) -> Response:
    record = await repository.get_quest(
        quest_id,
        viewer_id=user.id,
        include_unapproved=True,
    )
    if record is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    if record.is_seed:
        raise HTTPException(status_code=403, detail="预设内容不能删除，只能在本机隐藏")
    if user.role != "admin" and record.owner_id != user.id:
        raise HTTPException(status_code=403, detail="只能删除自己上传的支线")

    deleted = await repository.delete_quest(quest_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    storage.delete(deleted.image_filename)
    storage.delete(deleted.motion_filename)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/quests/{quest_id}/rating", response_model=RatingOut, tags=["rating"])
async def upsert_rating(
    quest_id: str,
    payload: RatingUpdate,
    repository: RepositoryDep,
    user: CurrentUser,
) -> RatingOut:
    summary = await repository.upsert_rating(quest_id, user.id, payload.score)
    if summary is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    return RatingOut(average=summary.average, votes=summary.votes, my_rating=summary.my_rating)


@router.delete("/quests/{quest_id}/rating", response_model=RatingOut, tags=["rating"])
async def delete_rating(
    quest_id: str,
    repository: RepositoryDep,
    user: CurrentUser,
) -> RatingOut:
    summary = await repository.delete_rating(quest_id, user.id)
    if summary is None:
        raise HTTPException(status_code=404, detail="没有找到这条支线")
    return RatingOut(average=summary.average, votes=summary.votes, my_rating=summary.my_rating)
