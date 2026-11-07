-- 杭电支线 · PostgreSQL schema reference
-- SQLAlchemy creates the same tables automatically on startup / `python -m app.init_db`.
-- Use this file when you want to create the schema manually in an existing database.

CREATE TABLE IF NOT EXISTS users (
    id             TEXT PRIMARY KEY,
    username       VARCHAR(32) NOT NULL UNIQUE,
    email          VARCHAR(254) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(16) NOT NULL DEFAULT 'user',
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at  TIMESTAMPTZ,
    CONSTRAINT ck_user_role CHECK (role IN ('user', 'admin'))
);

CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users (role);

CREATE TABLE IF NOT EXISTS quests (
    id                TEXT PRIMARY KEY,
    owner_id          TEXT REFERENCES users(id) ON DELETE SET NULL,
    title             VARCHAR(80) NOT NULL,
    shot_date         DATE NOT NULL,
    shot_time         TIME NOT NULL,
    place             VARCHAR(120) NOT NULL,
    feeling           TEXT NOT NULL,
    stamp             VARCHAR(80) NOT NULL DEFAULT 'PERSONAL ARCHIVE',
    category          VARCHAR(20) NOT NULL,
    image_url         VARCHAR(500) NOT NULL,
    image_filename    VARCHAR(255) NOT NULL,
    images_json       TEXT,
    motion_url        VARCHAR(500),
    motion_filename   VARCHAR(255),
    motion_mime       VARCHAR(80),
    status            VARCHAR(20) NOT NULL DEFAULT 'pending',
    review_reason     TEXT,
    reviewed_at       TIMESTAMPTZ,
    is_seed           BOOLEAN NOT NULL DEFAULT FALSE,
    seed_rating_sum   DOUBLE PRECISION NOT NULL DEFAULT 0,
    seed_rating_count INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_quest_status CHECK (status IN ('approved', 'pending', 'rejected'))
);

CREATE INDEX IF NOT EXISTS ix_quests_owner_id ON quests (owner_id);
CREATE INDEX IF NOT EXISTS ix_quests_shot_date ON quests (shot_date DESC);
CREATE INDEX IF NOT EXISTS ix_quests_category ON quests (category);
CREATE INDEX IF NOT EXISTS ix_quests_status ON quests (status);

CREATE TABLE IF NOT EXISTS ratings (
    id          SERIAL PRIMARY KEY,
    quest_id    TEXT NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score       INTEGER NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_rating_quest_user UNIQUE (quest_id, user_id),
    CONSTRAINT ck_rating_score_range CHECK (score BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS ix_ratings_quest_id ON ratings (quest_id);
CREATE INDEX IF NOT EXISTS ix_ratings_user_id ON ratings (user_id);

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
