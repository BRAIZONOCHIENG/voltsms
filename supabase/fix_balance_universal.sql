-- Drop previous versions to avoid conflicts
DROP FUNCTION IF EXISTS increment_balance(UUID, DECIMAL);
DROP FUNCTION IF EXISTS increment_balance(TEXT, DECIMAL);

-- Universal fix: Accept TEXT for user_id and case-insensitive comparison
CREATE OR REPLACE FUNCTION increment_balance(target_user_id TEXT, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount
  WHERE user_id::text = target_user_id::text;
END;
$$;
