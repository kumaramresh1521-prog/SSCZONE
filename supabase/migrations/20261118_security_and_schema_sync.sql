-- =========================================================================
-- SSCZONE PRODUCTION SECURITY HARDENING & SCHEMA SYNC MIGRATION
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================================

-- 1. PREVENT PRIVILEGE ESCALATION ON PROFILES
-- Ensure users cannot make themselves admin by sending { is_admin: true }
CREATE OR REPLACE FUNCTION public.check_profile_admin_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'Access Denied: Only existing administrators can modify the is_admin status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_profile_admin ON public.profiles;
CREATE TRIGGER tr_check_profile_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_admin_update();

-- 2. SECURE SUBSCRIPTIONS (PREVENT SELF-ACTIVATION)
-- Regular users must never be able to insert or update subscriptions directly.
-- All activations must happen via backend Razorpay webhook or admin service role.
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users update own subscriptions" ON public.subscriptions;

-- Ensure read policy is intact
DROP POLICY IF EXISTS "Users read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users read own subscriptions" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

-- 3. ENSURE QUESTION REPORTS TABLE & SECURE RLS
CREATE TABLE IF NOT EXISTS public.question_reports (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_reports_status ON public.question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_question_id ON public.question_reports(question_id);

ALTER TABLE public.question_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to insert reports" ON public.question_reports;
CREATE POLICY "Allow anyone to insert reports" ON public.question_reports
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to reports" ON public.question_reports;
DROP POLICY IF EXISTS "Allow admin full access to reports" ON public.question_reports;
CREATE POLICY "Allow admin full access to reports" ON public.question_reports
  FOR ALL USING (
    coalesce((auth.jwt()->'app_metadata'->>'role' = 'service_role'), false)
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 4. ENSURE SITE_SETTINGS TABLE & SECURE RLS
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write site_settings" ON public.site_settings;
CREATE POLICY "Admin write site_settings" ON public.site_settings 
  FOR ALL USING (
    coalesce((auth.jwt()->'app_metadata'->>'role' = 'service_role'), false)
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 5. ENSURE MISSING COLUMNS IN PREVIOUS_PAPERS & PAPER_QUESTIONS
ALTER TABLE public.previous_papers 
  ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE public.paper_questions 
  ADD COLUMN IF NOT EXISTS question_text_hi TEXT,
  ADD COLUMN IF NOT EXISTS explanation_hi TEXT,
  ADD COLUMN IF NOT EXISTS option_a_hi TEXT,
  ADD COLUMN IF NOT EXISTS option_b_hi TEXT,
  ADD COLUMN IF NOT EXISTS option_c_hi TEXT,
  ADD COLUMN IF NOT EXISTS option_d_hi TEXT;

-- 6. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to submit inquiry" ON public.contact_inquiries;
CREATE POLICY "Allow anyone to submit inquiry" ON public.contact_inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read inquiries" ON public.contact_inquiries;
CREATE POLICY "Admin read inquiries" ON public.contact_inquiries
  FOR SELECT USING (
    coalesce((auth.jwt()->'app_metadata'->>'role' = 'service_role'), false)
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
