-- Miden OTC Swap Board Database Schema

CREATE TABLE IF NOT EXISTS active_swaps (
    id SERIAL PRIMARY KEY,
    note_id VARCHAR(255) UNIQUE NOT NULL,
    creator_account VARCHAR(255) NOT NULL,
    offering_asset VARCHAR(100) NOT NULL,
    offering_amount NUMERIC NOT NULL,
    requesting_asset VARCHAR(100) NOT NULL,
    requesting_amount NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open' or 'consumed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_swaps_status ON active_swaps(status);
CREATE INDEX IF NOT EXISTS idx_swaps_creator ON active_swaps(creator_account);
