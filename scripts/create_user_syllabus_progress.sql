-- ==============================================================================
-- SSCZONE: Cloud Sync Table for Syllabus Tracker
-- Run this script in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_syllabus_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_slug TEXT NOT NULL DEFAULT 'ssc-cgl',
  chapter_id TEXT NOT NULL,
  theory_done BOOLEAN NOT NULL DEFAULT false,
  practice_done BOOLEAN NOT NULL DEFAULT false,
  revision_count INTEGER NOT NULL DEFAULT 0,
  confidence TEXT NOT NULL DEFAULT 'unrated',
  notes TEXT DEFAULT '',
  attachments JSONB DEFAULT '[]'::jsonb,
  target_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_syllabus_unique_chapter UNIQUE (user_id, exam_slug, chapter_id)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_usp_user_exam ON public.user_syllabus_progress (user_id, exam_slug);
CREATE INDEX IF NOT EXISTS idx_usp_updated ON public.user_syllabus_progress (updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_syllabus_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and modify their own progress
CREATE POLICY "Users can read own syllabus progress"
  ON public.user_syllabus_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own syllabus progress"
  ON public.user_syllabus_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own syllabus progress"
  ON public.user_syllabus_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own syllabus progress"
  ON public.user_syllabus_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
