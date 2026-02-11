-- Reset the volt_splitter_sync table to scan from the user's transaction block
-- Run this in Supabase SQL Editor to catch the missed deposit

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS volt_splitter_sync (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_block BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reset to just before the transaction block (79820163 - 10 = 79820153)
INSERT INTO volt_splitter_sync (id, last_block) 
VALUES (1, 79820153)
ON CONFLICT (id) DO UPDATE SET last_block = 79820153, updated_at = NOW();
