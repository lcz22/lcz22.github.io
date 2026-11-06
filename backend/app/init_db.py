"""Create the configured database tables.

Usage:
    python -m app.init_db

For production PostgreSQL, running this once creates the tables. For schema
changes later, switch to Alembic migrations.
"""

from __future__ import annotations

import asyncio

from .db import dispose_db, init_db


async def main() -> None:
    await init_db()
    await dispose_db()
    print("database tables are ready")


if __name__ == "__main__":
    asyncio.run(main())
