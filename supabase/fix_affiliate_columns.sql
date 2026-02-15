-- Standardize Affiliate Profiles Columns
-- This ensures the payout settings are stored as TEXT to avoid ENUM related update failures

DO $$ 
BEGIN 
    -- 1. Convert payout_method to TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='payout_method') THEN
        ALTER TABLE public.affiliate_profiles ALTER COLUMN payout_method TYPE TEXT;
    END IF;

    -- 2. Convert payout_frequency to TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='payout_frequency') THEN
        ALTER TABLE public.affiliate_profiles ALTER COLUMN payout_frequency TYPE TEXT;
    END IF;

    -- 3. Convert crypto_currency to TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='crypto_currency') THEN
        ALTER TABLE public.affiliate_profiles ALTER COLUMN crypto_currency TYPE TEXT;
    END IF;

    -- 4. Ensure other columns exist (idempotent)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='paypal_email') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN paypal_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='crypto_address') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN crypto_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='total_withdrawn') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN total_withdrawn DECIMAL(20, 2) DEFAULT 0;
    END IF;

END $$;

-- Enable RLS (Ensure it's on)
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;

-- Re-apply policies to be safe
DROP POLICY IF EXISTS "Users can update their own affiliate profile" ON affiliate_profiles;
CREATE POLICY "Users can update their own affiliate profile" ON affiliate_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own affiliate profile" ON affiliate_profiles;
CREATE POLICY "Users can view their own affiliate profile" ON affiliate_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Ensure service role has full access for admin panel
GRANT ALL ON TABLE public.affiliate_profiles TO service_role;
