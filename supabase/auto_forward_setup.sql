-- 1. Create table to map wallet addresses to users
CREATE TABLE IF NOT EXISTS user_wallets (
    address TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- 2. Create RPC function to safely increment balance
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount
  WHERE id = user_id;
END;
$$;

-- 3. Ensure volt_splitter_payments has forward_tx_hash column
ALTER TABLE volt_splitter_payments 
ADD COLUMN IF NOT EXISTS forward_tx_hash TEXT;

-- 4. Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_wallets TO service_role;
GRANT EXECUTE ON FUNCTION increment_balance TO service_role;
