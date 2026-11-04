-- ====================================================================
-- SSCZone Dedicated Subject Notes Table Migration
-- Run this script in the Supabase SQL Editor if you prefer a standalone table.
-- Note: SSCZone automatically supports saving notes via both this table
-- and the built-in blogs storage engine.
-- ====================================================================

CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  subject_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  title TEXT NOT NULL,
  hindi_title TEXT,
  slug TEXT UNIQUE NOT NULL,
  read_time TEXT DEFAULT '7 min read',
  subtopics JSONB DEFAULT '[]'::jsonb,
  overview TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  table_data JSONB DEFAULT '{}'::jsonb,
  tcs_trap TEXT,
  practice_mcq JSONB DEFAULT '{}'::jsonb,
  content TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_slug ON notes(slug);
CREATE INDEX IF NOT EXISTS idx_notes_is_active ON notes(is_active);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Read policy: Anyone can read active study notes
DROP POLICY IF EXISTS "Public read notes" ON notes;
CREATE POLICY "Public read notes" ON notes FOR SELECT USING (true);

-- Admin write policy: Only admins can insert, update, or delete
DROP POLICY IF EXISTS "Admin manage notes" ON notes;
CREATE POLICY "Admin manage notes" ON notes FOR ALL USING (
  COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false)
);
