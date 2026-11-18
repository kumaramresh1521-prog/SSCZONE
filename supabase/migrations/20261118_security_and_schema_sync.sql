-- =========================================================================
-- SSCZONE PRODUCTION SECURITY HARDENING & SCHEMA SYNC MIGRATION (V3)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================================

-- 1. ENSURE ALL OPTIONAL & HINDI COLUMNS EXIST IN PAPER_QUESTIONS
ALTER TABLE public.paper_questions 
  ADD COLUMN IF NOT EXISTS question_text_hi TEXT,
  ADD COLUMN IF NOT EXISTS explanation_hi TEXT,
  ADD COLUMN IF NOT EXISTS option_a_hi TEXT,
  ADD COLUMN IF NOT EXISTS option_b_hi TEXT,
  ADD COLUMN IF NOT EXISTS option_c_hi TEXT,
  ADD COLUMN IF NOT EXISTS option_d_hi TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS option_a_image_url TEXT,
  ADD COLUMN IF NOT EXISTS option_b_image_url TEXT,
  ADD COLUMN IF NOT EXISTS option_c_image_url TEXT,
  ADD COLUMN IF NOT EXISTS option_d_image_url TEXT;

-- Revoke table-level SELECT from anon and authenticated roles
REVOKE SELECT ON public.paper_questions FROM anon, authenticated;

-- Grant column-level SELECT ONLY on safe, non-sensitive columns
-- (correct_answer, explanation, explanation_hi are strictly excluded)
GRANT SELECT (
  id,
  paper_id,
  question_number,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  question_text_hi,
  option_a_hi,
  option_b_hi,
  option_c_hi,
  option_d_hi,
  image_url,
  option_a_image_url,
  option_b_image_url,
  option_c_image_url,
  option_d_image_url
) ON public.paper_questions TO anon, authenticated;

-- Ensure service_role and postgres maintain FULL access to all columns
GRANT ALL ON public.paper_questions TO service_role;
GRANT ALL ON public.paper_questions TO postgres;


-- 2. PREVENT PRIVILEGE ESCALATION ON PROFILES (UPDATE & INSERT)
CREATE OR REPLACE FUNCTION public.check_profile_admin_update()
RETURNS TRIGGER AS $$
DECLARE
  caller_role TEXT;
BEGIN
  IF NEW.is_admin IS NOT DISTINCT FROM OLD.is_admin THEN
    RETURN NEW;
  END IF;

  -- Allow direct execution by postgres / superuser / SQL Editor
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  -- Allow backend service-role operations
  BEGIN
    caller_role := coalesce(auth.jwt()->>'role', '');
    IF caller_role = 'service_role' THEN
      RETURN NEW;
    END IF;
  EXCEPTION WHEN OTHERS THEN
  END;

  -- Allow if caller is an existing authenticated admin
  IF auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Access Denied: Only administrators or service role can modify the is_admin status.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_profile_admin ON public.profiles;
CREATE TRIGGER tr_check_profile_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_admin_update();

-- Prevent users from setting is_admin = true during self-registration / INSERT
CREATE OR REPLACE FUNCTION public.check_profile_admin_insert()
RETURNS TRIGGER AS $$
DECLARE
  caller_role TEXT;
BEGIN
  IF NEW.is_admin IS NULL OR NEW.is_admin = false THEN
    NEW.is_admin := false;
    RETURN NEW;
  END IF;

  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  BEGIN
    caller_role := coalesce(auth.jwt()->>'role', '');
    IF caller_role = 'service_role' THEN
      RETURN NEW;
    END IF;
  EXCEPTION WHEN OTHERS THEN
  END;

  IF auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN NEW;
  END IF;

  NEW.is_admin := false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_profile_admin_insert ON public.profiles;
CREATE TRIGGER tr_check_profile_admin_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_admin_insert();


-- 3. SECURE SUBSCRIPTIONS (PREVENT SELF-ACTIVATION)
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users update own subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Users read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users read own subscriptions" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);


-- 4. QUESTION REPORTS (FIX FK MISMATCH FOR PYQ PAPERS & SPEED TESTS)
CREATE TABLE IF NOT EXISTS public.question_reports (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT,
  raw_question_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop foreign key to questions(id) if it exists, so PYQ paper_questions reports do not fail
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'question_reports_question_id_fkey' 
    AND table_name = 'question_reports'
  ) THEN
    ALTER TABLE public.question_reports DROP CONSTRAINT question_reports_question_id_fkey;
  END IF;
END $$;

ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS raw_question_id TEXT;
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
    coalesce((auth.jwt()->>'role' = 'service_role'), false)
    OR
    current_user IN ('postgres', 'supabase_admin')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 5. SITE SETTINGS TABLE & SECURE RLS
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
    coalesce((auth.jwt()->>'role' = 'service_role'), false)
    OR
    current_user IN ('postgres', 'supabase_admin')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- 6. ENSURE MISSING COLUMNS IN PREVIOUS_PAPERS
ALTER TABLE public.previous_papers 
  ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;


-- 7. CONTACT INQUIRIES TABLE
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
    coalesce((auth.jwt()->>'role' = 'service_role'), false)
    OR
    current_user IN ('postgres', 'supabase_admin')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
