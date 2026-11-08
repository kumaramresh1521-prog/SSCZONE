-- ====================================================================
-- SSCZone Interactive Syllabus Tracker & OneNote Scratchpad Migration
-- Stores user syllabus completion (Theory, 50+ PYQs, Revisions, Notes)
-- ====================================================================

CREATE TABLE IF NOT EXISTS user_syllabus_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_slug TEXT NOT NULL DEFAULT 'ssc-cgl',
  chapter_id TEXT NOT NULL,
  theory_done BOOLEAN DEFAULT false,
  practice_done BOOLEAN DEFAULT false,
  revision_count INT DEFAULT 0,
  confidence TEXT DEFAULT 'unrated',
  notes TEXT DEFAULT '',
  target_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exam_slug, chapter_id)
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_user_syllabus_lookup ON user_syllabus_progress(user_id, exam_slug);
CREATE INDEX IF NOT EXISTS idx_user_syllabus_chapter ON user_syllabus_progress(chapter_id);

-- Row Level Security
ALTER TABLE user_syllabus_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own syllabus progress" ON user_syllabus_progress;
CREATE POLICY "Users can read own syllabus progress" ON user_syllabus_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own syllabus progress" ON user_syllabus_progress;
CREATE POLICY "Users can insert own syllabus progress" ON user_syllabus_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own syllabus progress" ON user_syllabus_progress;
CREATE POLICY "Users can update own syllabus progress" ON user_syllabus_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own syllabus progress" ON user_syllabus_progress;
CREATE POLICY "Users can delete own syllabus progress" ON user_syllabus_progress
  FOR DELETE USING (auth.uid() = user_id);
