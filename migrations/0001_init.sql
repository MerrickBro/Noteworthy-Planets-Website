-- --== Planets ==--
CREATE TABLE IF NOT EXISTS planets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    star_system TEXT NOT NULL,
    galaxy TEXT NOT NULL,
    type TEXT NOT NULL,
    biome TEXT NOT NULL,
    economy TEXT NOT NULL,
    lifeform TEXT NOT NULL,
    resource1 TEXT NOT NULL,
    resource2 TEXT NOT NULL,
    resource3 TEXT NOT NULL,
    sentinel TEXT NOT NULL,
    hazard TEXT NOT NULL,
    facts TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL,
    poster TEXT NOT NULL COLLATE NOCASE,
    glyphs TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    hidden INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS planets_poster ON planets (poster);
CREATE INDEX IF NOT EXISTS planets_galaxy ON planets (galaxy);

-- --== Rate Limit ==--
CREATE TABLE IF NOT EXISTS post_log (
    ip TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS post_log_ip ON post_log (ip, created_at);
