-- VoltSplitter Payment Tracking Tables
-- Run this in Supabase SQL Editor

-- Table to track processed VoltSplitter payments
CREATE TABLE IF NOT EXISTS volt_splitter_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash TEXT UNIQUE NOT NULL,
    block_number BIGINT,
    wallet_address TEXT,
    user_id TEXT,
    token_address TEXT,
    amount_crypto DECIMAL(30, 18),
    amount_usd DECIMAL(20, 2),
    credited BOOLEAN DEFAULT FALSE,
    credited_amount DECIMAL(20, 2),
    balance_before DECIMAL(20, 2),
    balance_after DECIMAL(20, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_volt_payments_tx ON volt_splitter_payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_volt_payments_user ON volt_splitter_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_volt_payments_block ON volt_splitter_payments(block_number);

-- Sync state table to track last processed block
CREATE TABLE IF NOT EXISTS volt_splitter_sync (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_block BIGINT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial sync state
INSERT INTO volt_splitter_sync (id, last_block) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
ALTER TABLE volt_splitter_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE volt_splitter_sync ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage volt_splitter_payments" ON volt_splitter_payments
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage volt_splitter_sync" ON volt_splitter_sync
    FOR ALL USING (true) WITH CHECK (true);
