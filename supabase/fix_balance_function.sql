-- Fix for increment_balance function to use the correct 'user_id' column
-- Run this in the Supabase SQL Editor

-- Drop the old function first because we are changing parameter names
DROP FUNCTION IF EXISTS increment_balance(UUID, DECIMAL);

CREATE OR REPLACE FUNCTION increment_balance(target_user_id UUID, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount
  WHERE user_id = target_user_id;
END;
$$;
