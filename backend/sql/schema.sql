-- 杭电支线 · PostgreSQL schema reference
-- SQLAlchemy creates the same tables automatically on startup / `python -m app.init_db`.
-- Use this file when you want to create the schema manually in an existing database.

CREATE TABLE IF NOT EXISTS quests (
    id                TEXT PRIMARY KEY,
    title             VARCHAR(80) NOT NULL,
    shot_date         DATE NOT NULL,
    shot_time         TIME NOT NULL,
    place             VARCHAR(120) NOT NULL,
    feeling           TEXT NOT NULL,
    category          VARCHAR(20) NOT NULL,
    image_url         VARCHAR(500) NOT NULL,
    image_filename    VARCHAR(255) NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'approved',
    is_seed           BOOLEAN NOT NULL DEFAULT FALSE,
    seed_rating_sum   DOUBLE PRECISION NOT NULL DEFAULT 0,
    seed_rating_count INTEGER NOT NULL DEFAULT 0,
    edit_token_hash   VARCHAR(128),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_quest_status CHECK (status IN ('approved', 'pending'))
);

CREATE INDEX IF NOT EXISTS ix_quests_shot_date ON quests (shot_date DESC);
CREATE INDEX IF NOT EXISTS ix_quests_category ON quests (category);
CREATE INDEX IF NOT EXISTS ix_quests_status ON quests (status);

CREATE TABLE IF NOT EXISTS ratings (
    id          SERIAL PRIMARY KEY,
    quest_id    TEXT NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    visitor_id  VARCHAR(64) NOT NULL,
    score       INTEGER NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_rating_quest_visitor UNIQUE (quest_id, visitor_id),
    CONSTRAINT ck_rating_score_range CHECK (score BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS ix_ratings_quest_id ON ratings (quest_id);
CREATE INDEX IF NOT EXISTS ix_ratings_visitor_id ON ratings (visitor_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_quests_updated_at ON quests;
CREATE TRIGGER trg_quests_updated_at
BEFORE UPDATE ON quests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ratings_updated_at ON ratings;
CREATE TRIGGER trg_ratings_updated_at
BEFORE UPDATE ON ratings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
