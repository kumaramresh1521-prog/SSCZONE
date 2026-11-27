-- ====================================================================
-- SSCZone Universal Bookmarks & Saved Question Cloud Sync Migration
-- Fixes:
-- 1. Drops strict foreign key constraint so bookmarks can save from
--    paper_questions (PYQ shifts), daily_quizzes, and practice questions.
-- 2. Adds question_data JSONB to permanently preserve question statements,
--    options, Hindi translation, and explanations across all devices.
-- 3. Configures proper Row Level Security for authenticated users.
-- ====================================================================

-- 1. Drop foreign key constraint on question_id (prevents error 23503 when saving PYQ / daily quiz questions)
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_question_id_fkey;

-- 2. Make question_id nullable if not already
ALTER TABLE public.bookmarks ALTER COLUMN question_id DROP NOT NULL;

-- 3. Add question_data column for full JSON representation
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS question_data JSONB DEFAULT NULL;

-- 4. Add source column (practice, pyq, daily_quiz, speed_test)
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'practice';

-- 5. Enable Row Level Security and allow users to manage their own bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Add index for fast user bookmarks lookup
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON public.bookmarks(user_id, created_at DESC);
