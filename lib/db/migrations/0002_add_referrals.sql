CREATE TABLE IF NOT EXISTS referrals (
  id         SERIAL PRIMARY KEY,
  type       TEXT NOT NULL,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  specialty  TEXT,
  city       TEXT,
  notes      TEXT,
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
