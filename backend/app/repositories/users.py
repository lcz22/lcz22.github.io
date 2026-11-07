"""User persistence contract and SQLAlchemy implementation."""

from __future__ import annotations

from abc import ABC, abstractmethod

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import User


class UserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: str) -> User | None: ...

    @abstractmethod
    async def get_by_identifier(self, identifier: str) -> User | None: ...

    @abstractmethod
    async def username_exists(self, username: str) -> bool: ...

    @abstractmethod
    async def email_exists(self, email: str) -> bool: ...

    @abstractmethod
    async def create(self, *, username: str, email: str, password_hash: str, role: str = "user") -> User: ...

    @abstractmethod
    async def list_all(self, *, limit: int = 100, offset: int = 0) -> tuple[list[User], int]: ...

    @abstractmethod
    async def update(self, user: User, *, role: str | None = None, is_active: bool | None = None) -> User: ...

    @abstractmethod
    async def mark_login(self, user: User) -> None: ...

    @abstractmethod
    async def count_admins(self) -> int: ...


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: str) -> User | None:
        return await self.session.get(User, user_id)

    async def get_by_identifier(self, identifier: str) -> User | None:
        value = identifier.strip().lower()
        result = await self.session.execute(
            select(User).where(
                (func.lower(User.email) == value) | (func.lower(User.username) == value)
            )
        )
        return result.scalar_one_or_none()

    async def username_exists(self, username: str) -> bool:
        result = await self.session.execute(
            select(func.count(User.id)).where(func.lower(User.username) == username.lower())
        )
        return bool(result.scalar_one())

    async def email_exists(self, email: str) -> bool:
        result = await self.session.execute(
            select(func.count(User.id)).where(func.lower(User.email) == email.lower())
        )
        return bool(result.scalar_one())

    async def create(self, *, username: str, email: str, password_hash: str, role: str = "user") -> User:
        user = User(
            username=username,
            email=email.lower(),
            password_hash=password_hash,
            role=role,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def list_all(self, *, limit: int = 100, offset: int = 0) -> tuple[list[User], int]:
        total = int(
            (await self.session.execute(select(func.count(User.id)))).scalar_one()
        )
        result = await self.session.execute(
            select(User).order_by(User.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all()), total

    async def update(
        self,
        user: User,
        *,
        role: str | None = None,
        is_active: bool | None = None,
    ) -> User:
        if role is not None:
            user.role = role
        if is_active is not None:
            user.is_active = is_active
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def mark_login(self, user: User) -> None:
        from ..models import utcnow

        user.last_login_at = utcnow()
        await self.session.commit()

    async def count_admins(self) -> int:
        result = await self.session.execute(
            select(func.count(User.id)).where(User.role == "admin", User.is_active.is_(True))
        )
        return int(result.scalar_one())
