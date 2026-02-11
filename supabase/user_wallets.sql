CREATE TABLE IF NOT EXISTS user_wallets (
    address VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- RLS Policies (Optional but good practice)
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own wallet" ON user_wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own wallet" ON user_wallets
    FOR SELECT USING (auth.uid() = user_id);
    
-- Service role has full access (default)
