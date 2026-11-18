-- =========================================================================
-- SSCZONE SECURITY FIX V2
-- Fixes:
--   1. is_admin trigger bypass (SECURITY DEFINER + current_user bug)
--   2. Admin panel breakage caused by column-level SELECT revocation
--   3. Missing profiles INSERT policy / auto-create trigger
-- Run in Supabase Dashboard > SQL Editor. Idempotent.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. PROFILES: ADMIN ESCALATION GUARD (UPDATE)
-- Inside SECURITY DEFINER, current_user is always the function owner.
-- session_user is the real session identity. Use that + JWT role instead.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_profile_admin_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  IF NEW.is_admin IS NOT DISTINCT FROM OLD.is_admin THEN
    RETURN NEW;
  END IF;

  -- Direct DB access: SQL Editor / migrations / psql
  IF session_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  -- Backend service-role calls via PostgREST
  BEGIN
    caller_role := coalesce(auth.jwt()->>'role', '');
  EXCEPTION WHEN OTHERS THEN
    caller_role := '';
  END;

  IF caller_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Existing authenticated admin
  IF auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Access Denied: Only administrators or service role can modify the is_admin status.';
END;
$$;

DROP TRIGGER IF EXISTS tr_check_profile_admin ON public.profiles;
CREATE TRIGGER tr_check_profile_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_admin_update();

-- -------------------------------------------------------------------------
-- 2. PROFILES: ADMIN ESCALATION GUARD (INSERT)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_profile_admin_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  IF NEW.is_admin IS NULL OR NEW.is_admin = false THEN
    NEW.is_admin := false;
    RETURN NEW;
  END IF;

  IF session_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  BEGIN
    caller_role := coalesce(auth.jwt()->>'role', '');
  EXCEPTION WHEN OTHERS THEN
    caller_role := '';
  END;

  IF caller_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN NEW;
  END IF;

  -- Never allow a self-registered row to start as admin
  NEW.is_admin := false;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_profile_admin_insert ON public.profiles;
CREATE TRIGGER tr_check_profile_admin_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_admin_insert();

-- Restore self-service profile creation (live DB was missing this policy)
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Re-create auto-profile trigger if it is missing on live
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------------------
-- 3. PAPER_QUESTIONS: CLOSE ANSWER LEAK *AND* KEEP ADMIN PANEL WORKING
-- Column-level grants broke admin `select("*")` queries.
-- New model: anon gets nothing, authenticated gets table SELECT, RLS is
-- admin-only. Students read through the server API (service role).
-- -------------------------------------------------------------------------

-- Admin helper (recreated here so this migration is self-contained).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );
$$;

-- RLS must be ON for the admin-only policy to actually protect rows.
ALTER TABLE public.paper_questions ENABLE ROW LEVEL SECURITY;

REVOKE SELECT ON public.paper_questions FROM anon, authenticated;
GRANT SELECT ON public.paper_questions TO authenticated;
GRANT ALL ON public.paper_questions TO service_role;

DROP POLICY IF EXISTS "Public read paper_questions" ON public.paper_questions;
DROP POLICY IF EXISTS "Admins read paper_questions" ON public.paper_questions;
CREATE POLICY "Admins read paper_questions" ON public.paper_questions
  FOR SELECT USING (public.is_admin());

-- Safety net: drop any other SELECT policy that could re-open the leak.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'paper_questions'
      AND cmd = 'SELECT'
      AND policyname <> 'Admins read paper_questions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.paper_questions', pol.policyname);
  END LOOP;
END $$;

-- -------------------------------------------------------------------------
-- 4. RELOAD POSTGREST SCHEMA CACHE (grants/policies changed)
-- -------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
