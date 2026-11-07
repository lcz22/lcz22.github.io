"""Create or promote an administrator.

Usage:
    python -m app.create_admin admin admin@example.com "a-strong-password"
"""

from __future__ import annotations

import argparse
import asyncio
import getpass

from .db import SessionLocal, dispose_db, init_db
from .repositories.users import SqlAlchemyUserRepository
from .security import hash_password


async def create_admin(username: str, email: str, password: str) -> None:
    if len(password) < 8:
        raise SystemExit("password must be at least 8 characters")
    await init_db()
    async with SessionLocal() as session:
        repository = SqlAlchemyUserRepository(session)
        existing = await repository.get_by_identifier(username)
        if existing is None:
            existing = await repository.get_by_identifier(email)
        if existing is not None:
            await repository.update(existing, role="admin", is_active=True)
            print(f"promoted existing user to admin: {existing.username}")
        else:
            user = await repository.create(
                username=username.strip(),
                email=email.strip().lower(),
                password_hash=hash_password(password),
                role="admin",
            )
            print(f"created admin: {user.username}")
    await dispose_db()


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or promote a 杭电支线 administrator")
    parser.add_argument("username")
    parser.add_argument("email")
    parser.add_argument("password", nargs="?")
    args = parser.parse_args()
    password = args.password or getpass.getpass("admin password: ")
    asyncio.run(create_admin(args.username, args.email, password))


if __name__ == "__main__":
    main()
