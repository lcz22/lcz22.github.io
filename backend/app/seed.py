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
from .models import Quest

SEED_FILE = Path(__file__).resolve().parent.parent / "seed" / "presets.json"


async def seed() -> None:
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    await init_db()

    inserted = 0
    async with SessionLocal() as session:
        existing = set(
            (await session.execute(select(Quest.id))).scalars().all()
        )
        for item in data:
            if item["id"] in existing:
                continue
            quest = Quest(
                id=item["id"],
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
