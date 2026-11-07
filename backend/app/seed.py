"""Import the 16 preset 杭电支线 stories into the configured database.

Usage:
    cd backend
    python -m app.seed

The seed images stay in the frontend's assets directory; their URLs are built
from FRONTEND_BASE_URL. Running the seed twice is safe: existing IDs are skipped.
"""

from __future__ import annotations

import asyncio
import json
from datetime import date, time
from pathlib import Path

from sqlalchemy import select

from .config import settings
from .db import SessionLocal, dispose_db, init_db
from .models import Quest, User

SEED_FILE = Path(__file__).resolve().parent.parent / "seed" / "presets.json"


async def seed() -> None:
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    await init_db()

    inserted = 0
    async with SessionLocal() as session:
        archive = (
            await session.execute(select(User).where(User.username == "杭电档案"))
        ).scalar_one_or_none()
        if archive is None:
            archive = User(
                username="杭电档案",
                email="archive@example.com",
                password_hash="!",
                role="user",
                is_active=False,
            )
            session.add(archive)
            await session.flush()

        existing_quests = {
            quest.id: quest
            for quest in (await session.execute(select(Quest))).scalars().all()
        }
        for item in data:
            existing = existing_quests.get(item["id"])
            if existing is not None:
                if existing.owner_id is None:
                    existing.owner_id = archive.id
                continue
            quest = Quest(
                id=item["id"],
                owner_id=archive.id,
                title=item["title"],
                shot_date=date.fromisoformat(item["iso"]),
                shot_time=time.fromisoformat(item["time"]),
                place=item["place"],
                feeling=item["feeling"],
                stamp=item.get("stamp") or "PERSONAL ARCHIVE",
                category=item["category"],
                image_url=f"{settings.frontend_base_url}/{item['image']}",
                image_filename="",
                status="approved",
                is_seed=True,
                seed_rating_sum=float(item["baseScore"]) * int(item["baseVotes"]),
                seed_rating_count=int(item["baseVotes"]),
            )
            session.add(quest)
            inserted += 1
        await session.commit()

    await dispose_db()
    print(f"seed completed: inserted {inserted} quests")


if __name__ == "__main__":
    asyncio.run(seed())
