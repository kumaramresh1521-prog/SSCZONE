-- SSCZone Database Schema

-- Exams (UPSC, TNPSC, SSC, etc.)
CREATE TABLE exams (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subjects (Polity, Geography, etc.)
CREATE TABLE subjects (
  id BIGSERIAL PRIMARY KEY,
  exam_id BIGINT REFERENCES exams(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_id, slug)
);

-- Topics (Fundamental Rights, Climatology, etc.)
CREATE TABLE topics (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subject_id, slug)
);

-- Questions (MCQs)
CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  topic_id BIGINT REFERENCES topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  year_reference INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Previous Year Papers
CREATE TABLE previous_papers (
  id BIGSERIAL PRIMARY KEY,
  exam_id BIGINT REFERENCES exams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  year INT NOT NULL,
  total_questions INT NOT NULL,
  duration_minutes INT DEFAULT 180,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Paper Questions
CREATE TABLE paper_questions (
  id BIGSERIAL PRIMARY KEY,
  paper_id BIGINT REFERENCES previous_papers(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  question_number INT NOT NULL
);

-- Users (extends Supabase auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Packages/Plans
CREATE TABLE packages (
  id BIGSERIAL PRIMARY KEY,
  exam_id BIGINT REFERENCES exams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  package_id BIGINT REFERENCES packages(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Test Attempts
CREATE TABLE test_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paper_id BIGINT REFERENCES previous_papers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  score INT,
  total_questions INT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned'))
);

-- Bookmarks
CREATE TABLE bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL DEFAULT 'Saved',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- User Answers
CREATE TABLE user_answers (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id BIGINT REFERENCES paper_questions(id) ON DELETE CASCADE,
  selected_answer CHAR(1),
  is_correct BOOLEAN
);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE previous_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Admin helper (SECURITY DEFINER avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Auto-create profile on signup
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

-- Public read policies
CREATE POLICY "Public read exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read papers" ON previous_papers FOR SELECT USING (true);
CREATE POLICY "Public read paper_questions" ON paper_questions FOR SELECT USING (true);
CREATE POLICY "Public read packages" ON packages FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Bookmarks policies
CREATE POLICY "Users manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Test attempts policies
CREATE POLICY "Users read own attempts" ON test_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own attempts" ON test_attempts FOR UPDATE USING (auth.uid() = user_id);

-- User answers policies
CREATE POLICY "Users read own answers" ON user_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM test_attempts t WHERE t.id = attempt_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users insert own answers" ON user_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM test_attempts t WHERE t.id = attempt_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users update own answers" ON user_answers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM test_attempts t WHERE t.id = attempt_id AND t.user_id = auth.uid())
);

-- Admin access (via is_admin() - no recursion)
CREATE POLICY "Admin all access exams" ON exams FOR ALL USING (is_admin());
CREATE POLICY "Admin all access subjects" ON subjects FOR ALL USING (is_admin());
CREATE POLICY "Admin all access topics" ON topics FOR ALL USING (is_admin());
CREATE POLICY "Admin all access questions" ON questions FOR ALL USING (is_admin());
CREATE POLICY "Admin all access papers" ON previous_papers FOR ALL USING (is_admin());
CREATE POLICY "Admin all access paper_questions" ON paper_questions FOR ALL USING (is_admin());
CREATE POLICY "Admin all access profiles" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "Admin all access packages" ON packages FOR ALL USING (is_admin());
CREATE POLICY "Admin all access subscriptions" ON subscriptions FOR ALL USING (is_admin());
CREATE POLICY "Admin all access bookmarks" ON bookmarks FOR ALL USING (is_admin());
CREATE POLICY "Admin all access test_attempts" ON test_attempts FOR ALL USING (is_admin());
CREATE POLICY "Admin all access user_answers" ON user_answers FOR ALL USING (is_admin());

-- ── Performance Indexes ──
CREATE INDEX IF NOT EXISTS idx_subjects_exam_id ON subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_active ON questions(topic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_previous_papers_exam_id ON previous_papers(exam_id);
CREATE INDEX IF NOT EXISTS idx_paper_questions_paper_id ON paper_questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
