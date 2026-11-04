-- ========================================================
-- Migration: Add PDF Support to previous_papers table
-- Run this in Supabase Dashboard -> SQL Editor (Optional but Recommended)
-- ========================================================

ALTER TABLE previous_papers 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Performance index for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_previous_papers_year_active 
ON previous_papers(year DESC, is_active);
