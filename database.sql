CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS verified_developers (
    id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id    TEXT UNIQUE NOT NULL,  -- Miden Bech32 account ID, NOT an EVM address
    github_handle TEXT NOT NULL,
    proof_hash    TEXT NOT NULL,         -- SHA-256 hex of the simulated STARK proof
    verified_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_verified_at
  ON verified_developers (verified_at DESC);
