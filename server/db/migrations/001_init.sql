CREATE TABLE IF NOT EXISTS insights (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  brand      INTEGER NOT NULL,
  createdAt  TEXT    NOT NULL,
  text       TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_insights_brand ON insights(brand);