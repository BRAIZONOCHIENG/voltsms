-- Crypto Payment System Schema (Fixed for Supabase)
-- Run this in your Supabase SQL Editor

-- Pending crypto payments (stores payment requests before confirmation)
CREATE TABLE IF NOT EXISTS pending_crypto_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    track_id VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    profit_amount DECIMAL(10,2),
    smspool_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pending_payments_track_id ON pending_crypto_payments(track_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_crypto_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_crypto_payments(status);

-- Transactions log (audit trail for all balance changes)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2),
    balance_after DECIMAL(10,2),
    currency VARCHAR(10),
    status VARCHAR(20) DEFAULT 'completed',
    description TEXT,
    reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);

-- SMSPool forwarding tracking (for manual transfers)
CREATE TABLE IF NOT EXISTS smspool_forwarding_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES pending_crypto_payments(id),
    amount_usd DECIMAL(10,2) NOT NULL,
    forwarded BOOLEAN DEFAULT FALSE,
    forwarded_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profit tracking
CREATE TABLE IF NOT EXISTS profit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES pending_crypto_payments(id),
    amount_usd DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
