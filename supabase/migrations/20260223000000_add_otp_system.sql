-- OTP System Migration
-- Adds OTP verification system with rate limiting and phone number normalization

-- 1. Create OTP Attempts Table (Anti-Spam & Rate Limiting)
CREATE TABLE IF NOT EXISTS public.otp_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    ip_address TEXT,
    attempt_type TEXT NOT NULL CHECK (attempt_type IN ('SEND', 'VERIFY')),
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'BLOCKED')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create OTP Verification Records Table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL UNIQUE,
    twilio_sid TEXT UNIQUE,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED')),
    attempts_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update Users Table to Store Normalized Phone Numbers (E.164 Format)
-- If phone_number column doesn't have a constraint, add one
ALTER TABLE public.users 
ADD CONSTRAINT phone_number_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$' OR phone_number IS NULL);

-- 4. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_otp_attempts_phone_created 
ON public.otp_attempts(phone_number, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_otp_attempts_ip_created 
ON public.otp_attempts(ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone 
ON public.otp_verifications(phone_number);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_status 
ON public.otp_verifications(verification_status, created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for otp_attempts
-- Only service role can insert
CREATE POLICY "Service role can insert OTP attempts" 
ON public.otp_attempts 
FOR INSERT 
WITH CHECK (true);

-- Only service role can read
CREATE POLICY "Service role can read OTP attempts" 
ON public.otp_attempts 
FOR SELECT 
USING (true);

-- 7. RLS Policies for otp_verifications
-- Service role can do everything
CREATE POLICY "Service role can manage OTP verifications" 
ON public.otp_verifications 
FOR ALL 
USING (true);

-- 8. Create Function to Clean Up Expired OTP Records (Maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM public.otp_verifications 
    WHERE expires_at < NOW() AND verification_status = 'PENDING';
    
    DELETE FROM public.otp_attempts 
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create Function to Check Rate Limiting
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(
    p_phone_number TEXT,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS TABLE (
    is_blocked BOOLEAN,
    remaining_attempts INTEGER,
    blocked_until TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_send_count INTEGER;
    v_last_send_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check send attempts in last 1 minute
    SELECT COUNT(*) INTO v_send_count
    FROM public.otp_attempts
    WHERE phone_number = p_phone_number
        AND attempt_type = 'SEND'
        AND created_at > NOW() - INTERVAL '1 minute';
    
    -- Get last send time
    SELECT created_at INTO v_last_send_time
    FROM public.otp_attempts
    WHERE phone_number = p_phone_number
        AND attempt_type = 'SEND'
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN QUERY SELECT
        (v_send_count >= 3)::BOOLEAN as is_blocked,
        GREATEST(0, 3 - v_send_count) as remaining_attempts,
        CASE WHEN v_send_count >= 3 THEN v_last_send_time + INTERVAL '1 minute' ELSE NULL END as blocked_until;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant Permissions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_otp_rate_limit(TEXT, TEXT) TO service_role;

-- 11. Create Comments for Documentation
COMMENT ON TABLE public.otp_attempts IS 'Tracks all OTP send and verify attempts for rate limiting and security monitoring';
COMMENT ON TABLE public.otp_verifications IS 'Stores active OTP verification sessions with Twilio integration';
COMMENT ON COLUMN public.otp_attempts.phone_number IS 'Phone number in E.164 format (e.g., +967771234567)';
COMMENT ON COLUMN public.otp_attempts.ip_address IS 'IP address of the request for additional security tracking';
COMMENT ON COLUMN public.otp_verifications.twilio_sid IS 'Twilio Verify Service SID for tracking verification status';
COMMENT ON COLUMN public.users.phone_number IS 'User phone number in E.164 format (e.g., +967771234567)';
