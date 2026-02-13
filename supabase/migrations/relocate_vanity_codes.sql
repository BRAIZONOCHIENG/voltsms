-- Migration: Add custom_code to affiliate_profiles and update linking logic (with Anti-Fraud)

-- 1. Add the missing columns
ALTER TABLE public.affiliate_profiles 
ADD COLUMN IF NOT EXISTS custom_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS registration_ip TEXT,
ADD COLUMN IF NOT EXISTS registration_fingerprint TEXT;

-- 2. Add an index for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_custom_code ON public.affiliate_profiles(custom_code);

-- 3. Update the handle_new_user_referral function to support custom codes + Anti-Fraud
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referral_code_val TEXT;
    referrer_user_id UUID;
    referee_ip TEXT;
    referee_fingerprint TEXT;
    referrer_ip TEXT;
    referrer_fingerprint TEXT;
BEGIN
    -- Extract referral data from user metadata
    referral_code_val := NEW.raw_user_meta_data->>'ref_code';
    referee_ip := NEW.raw_user_meta_data->>'ip';
    referee_fingerprint := NEW.raw_user_meta_data->>'fingerprint';
    
    IF referral_code_val IS NOT NULL THEN
        -- Find the user ID who owns this referral code (check both system and custom)
        -- Also get their registration IP/Fingerprint for fraud check
        SELECT user_id, registration_ip, registration_fingerprint 
        INTO referrer_user_id, referrer_ip, referrer_fingerprint
        FROM public.affiliate_profiles 
        WHERE referral_code = referral_code_val 
        OR UPPER(custom_code) = UPPER(referral_code_val);
        
        IF referrer_user_id IS NOT NULL THEN
            -- SELF-REFERRAL CHECK
            IF referrer_user_id = NEW.id OR 
               (referee_ip IS NOT NULL AND referee_ip = referrer_ip) OR 
               (referee_fingerprint IS NOT NULL AND referee_fingerprint = referrer_fingerprint) 
            THEN
                -- Fraud detected: Block linking
                RETURN NEW;
            END IF;

            -- Link them!
            INSERT INTO public.affiliate_referrals (referrer_id, referee_id)
            VALUES (referrer_user_id, NEW.id)
            ON CONFLICT (referee_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;
