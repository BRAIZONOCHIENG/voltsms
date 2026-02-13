-- Affiliate System
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
        CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'paid', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_method_type') THEN
        CREATE TYPE payout_method_type AS ENUM ('paypal', 'crypto');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_frequency_type') THEN
        CREATE TYPE payout_frequency_type AS ENUM ('bi-weekly', 'monthly');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crypto_currency_type') THEN
        CREATE TYPE crypto_currency_type AS ENUM ('USDT', 'USDC', 'BNB');
    END IF;
END $$;

-- 1. Affiliate Profiles: Stores partner information
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    custom_code TEXT UNIQUE, -- Optional vanity code (e.g. "OFFER10")
    total_earned DECIMAL(20, 2) DEFAULT 0,
    total_withdrawn DECIMAL(20, 2) DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, suspended
    
    -- Payout Preferences
    payout_method payout_method_type DEFAULT 'crypto',
    payout_frequency payout_frequency_type DEFAULT 'bi-weekly',
    paypal_email TEXT,
    crypto_address TEXT,
    crypto_currency crypto_currency_type DEFAULT 'USDT',
    crypto_network TEXT DEFAULT 'BEP20',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_affiliate_user_id ON affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_code ON affiliate_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_custom_code ON affiliate_profiles(custom_code);

-- 2. Affiliate Referrals (Tracks who was referred by whom)
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referee_id) -- A user can only be referred once
);

CREATE INDEX IF NOT EXISTS idx_referral_referrer ON affiliate_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_referee ON affiliate_referrals(referee_id);

-- 3. Affiliate Commissions (Earnings per deposit)
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_payment_id UUID, -- Links to volt_splitter_payments or other payment tables
    amount_usd DECIMAL(20, 2) NOT NULL, -- The 15% cut
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_referrer ON affiliate_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_commission_status ON affiliate_commissions(status);

-- Enable RLS
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Policies (Idempotent)
DROP POLICY IF EXISTS "Users can view their own affiliate profile" ON affiliate_profiles;
CREATE POLICY "Users can view their own affiliate profile" ON affiliate_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own affiliate profile" ON affiliate_profiles;
CREATE POLICY "Users can create their own affiliate profile" ON affiliate_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own affiliate profile" ON affiliate_profiles;
CREATE POLICY "Users can update their own affiliate profile" ON affiliate_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own referrals" ON affiliate_referrals;
CREATE POLICY "Users can view their own referrals" ON affiliate_referrals
    FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can view their own commissions" ON affiliate_commissions;
CREATE POLICY "Users can view their own commissions" ON affiliate_commissions
    FOR SELECT USING (auth.uid() = referrer_id);

-- Service Role full access
GRANT ALL ON TABLE public.affiliate_profiles TO service_role;
GRANT ALL ON TABLE public.affiliate_referrals TO service_role;
GRANT ALL ON TABLE public.affiliate_commissions TO service_role;

-- 4. Referral Linking Function (Runs after user signs up)
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referral_code_val TEXT;
    referrer_user_id UUID;
BEGIN
    -- Extract ref_code from user metadata
    referral_code_val := NEW.raw_user_meta_data->>'ref_code';
    
    IF referral_code_val IS NOT NULL THEN
        -- Find the user ID who owns this referral code (check both system and custom)
        SELECT user_id INTO referrer_user_id 
        FROM public.affiliate_profiles 
        WHERE referral_code = referral_code_val 
        OR UPPER(custom_code) = UPPER(referral_code_val);
        
        IF referrer_user_id IS NOT NULL AND referrer_user_id != NEW.id THEN
            -- Link them!
            INSERT INTO public.affiliate_referrals (referrer_id, referee_id)
            VALUES (referrer_user_id, NEW.id)
            ON CONFLICT (referee_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger: Link referral on insertion into auth.users
-- Note: We use auth.users but linking can be done on signup even before confirmation
CREATE OR REPLACE TRIGGER on_auth_user_created_link_referral
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_referral();


-- 5. Commission Generation Logic
-- This will be called from the payment processing code, but we can also use a trigger on deposits
CREATE OR REPLACE FUNCTION public.process_affiliate_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_uid UUID;
    commission_amt DECIMAL(20, 2);
BEGIN
    -- Logic: 
    -- 1. Must be credited and amount > 0
    -- 2. Must be an INSERT with credited=true OR an UPDATE where credited switched from false to true
    IF (NEW.credited = TRUE AND NEW.amount_usd > 0) AND 
       (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.credited = FALSE)) THEN
        
        -- Check if this user was referred
        SELECT referrer_id INTO referrer_uid 
        FROM public.affiliate_referrals 
        WHERE referee_id = CAST(NEW.user_id AS UUID);
        
        IF referrer_uid IS NOT NULL THEN
            -- Idempotency check: Ensure we don't create duplicate commissions for the same payment
            IF NOT EXISTS (SELECT 1 FROM public.affiliate_commissions WHERE source_payment_id = NEW.id) THEN
                -- 1. Referrer Commission (15%)
                commission_amt := NEW.amount_usd * 0.15;
                
                -- Insert commission record
                INSERT INTO public.affiliate_commissions (referrer_id, referee_id, source_payment_id, amount_usd, status)
                VALUES (referrer_uid, CAST(NEW.user_id AS UUID), NEW.id, commission_amt, 'pending');
                
                -- Update affiliate profile total earned
                UPDATE public.affiliate_profiles
                SET total_earned = total_earned + commission_amt
                WHERE user_id = referrer_uid;

                -- 2. Referee Bonus (10% on EVERY Deposit for Referred Users)
                DECLARE
                    bonus_amt DECIMAL(20, 2);
                BEGIN
                    bonus_amt := NEW.amount_usd * 0.10;
                    
                    -- Credit the user immediately
                    PERFORM public.increment_balance(CAST(NEW.user_id AS UUID), bonus_amt);
                    
                    -- Log in transactions for unified history
                    INSERT INTO public.transactions (user_id, type, amount, status, description, reference)
                    VALUES (CAST(NEW.user_id AS UUID), 'referral_bonus', bonus_amt, 'completed', '10% Partner Bonus', NEW.id::text);

                    -- Log in notes for transparency in legacy table
                    UPDATE public.volt_splitter_payments
                    SET notes = COALESCE(notes, '') || ' | 10% Partner Bonus Applied: $' || bonus_amt
                    WHERE id = NEW.id;
                END;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger: Generate commission when a payment is credited (on INSERT or UPDATE)
CREATE OR REPLACE TRIGGER on_payment_credited_generate_commission
    AFTER INSERT OR UPDATE OF credited ON public.volt_splitter_payments
    FOR EACH ROW 
    EXECUTE FUNCTION public.process_affiliate_commission();
