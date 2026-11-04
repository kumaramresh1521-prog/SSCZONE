-- ========================================================
-- Migration: Add Explanation Column to paper_questions table
-- Run this in Supabase Dashboard -> SQL Editor
-- ========================================================

ALTER TABLE paper_questions 
ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Verify
COMMENT ON COLUMN paper_questions.explanation IS 'Detailed step-by-step mathematical explanation or reasoning logic';
