-- Migration: Add allow_download and pdf_url columns to previous_papers table
ALTER TABLE previous_papers 
ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT TRUE;

ALTER TABLE previous_papers 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Create papers storage bucket if not already created
INSERT INTO storage.buckets (id, name, public) 
VALUES ('papers', 'papers', true)
ON CONFLICT (id) DO NOTHING;
