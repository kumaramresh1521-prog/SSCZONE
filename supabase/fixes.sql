-- SSCZone RLS Fixes
-- Run this ENTIRE file in Supabase SQL Editor

-- 1) Fix infinite recursion: create is_admin() helper (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2) Drop ALL old policies (avoid duplicate errors)
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin all access profiles" ON profiles;
DROP POLICY IF EXISTS "Admin all access exams" ON exams;
DROP POLICY IF EXISTS "Admin all access subjects" ON subjects;
DROP POLICY IF EXISTS "Admin all access topics" ON topics;
DROP POLICY IF EXISTS "Admin all access questions" ON questions;
DROP POLICY IF EXISTS "Admin all access papers" ON previous_papers;
DROP POLICY IF EXISTS "Admin all access packages" ON packages;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public read exams" ON exams;
DROP POLICY IF EXISTS "Public read subjects" ON subjects;
DROP POLICY IF EXISTS "Public read topics" ON topics;
DROP POLICY IF EXISTS "Public read questions" ON questions;
DROP POLICY IF EXISTS "Public read papers" ON previous_papers;
DROP POLICY IF EXISTS "Public read paper_questions" ON paper_questions;
DROP POLICY IF EXISTS "Public read packages" ON packages;
DROP POLICY IF EXISTS "Users manage own bookmarks" ON bookmarks;

-- 3) Ensure is_admin column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 4) Public read policies (content tables)
CREATE POLICY "Public read exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read papers" ON previous_papers FOR SELECT USING (true);
CREATE POLICY "Public read paper_questions" ON paper_questions FOR SELECT USING (true);
CREATE POLICY "Public read packages" ON packages FOR SELECT USING (true);

-- 5) Admin full access (using is_admin() - no recursion)
CREATE POLICY "Admin all access exams" ON exams FOR ALL USING (is_admin());
CREATE POLICY "Admin all access subjects" ON subjects FOR ALL USING (is_admin());
CREATE POLICY "Admin all access topics" ON topics FOR ALL USING (is_admin());
CREATE POLICY "Admin all access questions" ON questions FOR ALL USING (is_admin());
CREATE POLICY "Admin all access papers" ON previous_papers FOR ALL USING (is_admin());
CREATE POLICY "Admin all access paper_questions" ON paper_questions FOR ALL USING (is_admin());
CREATE POLICY "Admin all access packages" ON packages FOR ALL USING (is_admin());
CREATE POLICY "Admin all access profiles" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "Admin all access subscriptions" ON subscriptions FOR ALL USING (is_admin());
CREATE POLICY "Admin all access test_attempts" ON test_attempts FOR ALL USING (is_admin());
CREATE POLICY "Admin all access user_answers" ON user_answers FOR ALL USING (is_admin());
CREATE POLICY "Admin all access bookmarks" ON bookmarks FOR ALL USING (is_admin());

-- 6) Profile policies
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 7) Auto-create profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8) Bookmarks
CREATE POLICY "Users manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- 9) Subscriptions (per-user)
CREATE POLICY "Users read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 10) Test attempts (per-user)
CREATE POLICY "Users read own attempts" ON test_attempts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own attempts" ON test_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- 11) User answers (per-user via attempt owner)
CREATE POLICY "Users read own answers" ON user_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM test_attempts t WHERE t.id = attempt_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Users insert own answers" ON user_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM test_attempts t WHERE t.id = attempt_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Users update own answers" ON user_answers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM test_attempts t WHERE t.id = attempt_id AND t.user_id = auth.uid())
  );
