-- --== Accounts ==--
ALTER TABLE planets ADD COLUMN user_id TEXT;
CREATE INDEX IF NOT EXISTS planets_user ON planets (user_id);

CREATE TABLE IF NOT EXISTS accounts (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
