-- 1. Ensure columns exist in affiliate_profiles (ALTER is idempotent with IF NOT EXISTS in pg 9.6+)
-- But standard ALTER doesn't have IF NOT EXISTS for columns, so we use a DO block.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='payout_method') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN payout_method TEXT DEFAULT 'crypto';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='payout_frequency') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN payout_frequency TEXT DEFAULT 'bi-weekly';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='paypal_email') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN paypal_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='crypto_address') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN crypto_address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='crypto_currency') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN crypto_currency TEXT DEFAULT 'USDT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='crypto_network') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN crypto_network TEXT DEFAULT 'BEP20';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='affiliate_profiles' AND column_name='total_withdrawn') THEN
        ALTER TABLE public.affiliate_profiles ADD COLUMN total_withdrawn DECIMAL(20, 2) DEFAULT 0;
    END IF;
END $$;

-- 2. Create Payouts History Table
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
    amount_usd DECIMAL(20, 2) NOT NULL,
    payout_method TEXT NOT NULL, -- 'paypal' or 'crypto'
    payout_details TEXT NOT NULL, -- email or address
    transaction_id TEXT, -- Optional: TX Hash or PayPal ID
    status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own payouts" ON affiliate_payouts;
CREATE POLICY "Users can view their own payouts" ON affiliate_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM affiliate_profiles 
            WHERE id = affiliate_payouts.affiliate_id 
            AND user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.affiliate_payouts TO service_role;
GRANT SELECT ON TABLE public.affiliate_payouts TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload_schema';
