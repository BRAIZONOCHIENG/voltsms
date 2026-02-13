-- Add deposit address and derivation index to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deposit_address TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS derivation_index INTEGER UNIQUE;

-- Index for fast lookup in processor
CREATE INDEX IF NOT EXISTS idx_users_deposit_address ON users(deposit_address);
