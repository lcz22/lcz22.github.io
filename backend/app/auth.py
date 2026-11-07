"""Registration, login and current-user routes."""

from __future__ import annotations

import re
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .db import get_session
from .repositories.users import SqlAlchemyUserRepository, UserRepository
from .schemas import LoginIn, RegisterIn, TokenOut, UserOut
from .security import CurrentUser, create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

USERNAME_PATTERN = re.compile(r"^[\w\u4e00-\u9fff-]{2,32}$")


def get_user_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> UserRepository:
    return SqlAlchemyUserRepository(session)


UserRepo = Annotated[UserRepository, Depends(get_user_repository)]


def _token_response(user) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user),
        user=UserOut.model_validate(user),
    )


@router.get("/config")
async def auth_config() -> dict[str, bool]:
    return {"allow_registration": settings.allow_registration}


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterIn, repository: UserRepo) -> TokenOut:
    if not settings.allow_registration:
        raise HTTPException(status_code=403, detail="当前未开放注册")

    username = payload.username.strip()
    email = str(payload.email).strip().lower()
    if not USERNAME_PATTERN.fullmatch(username):
        raise HTTPException(
            status_code=422,
            detail="用户名需要 2–32 位，可使用中文、字母、数字、下划线或短横线",
        )

    if await repository.username_exists(username):
        raise HTTPException(status_code=409, detail="这个用户名已经被使用")
    if await repository.email_exists(email):
        raise HTTPException(status_code=409, detail="这个邮箱已经注册过")

    try:
        user = await repository.create(
            username=username,
            email=email,
            password_hash=hash_password(payload.password),
        )
    except IntegrityError as exc:
        raise HTTPException(status_code=409, detail="用户名或邮箱已经存在") from exc

    return _token_response(user)


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn, repository: UserRepo) -> TokenOut:
    user = await repository.get_by_identifier(payload.identifier)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码不正确")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="这个账号已被停用")
    await repository.mark_login(user)
    return _token_response(user)


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)
