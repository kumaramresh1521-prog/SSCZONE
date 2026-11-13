-- ============================================================
-- Math Review Table — SSCZone
-- Run this in Supabase SQL Editor (safe — creates new table only)
-- Does NOT touch any existing tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.math_review (
  id               BIGSERIAL PRIMARY KEY,

  -- Link to existing question (read-only reference — never cascades delete)
  question_id      BIGINT NOT NULL,
  paper_id         BIGINT NOT NULL,
  question_number  INTEGER,

  -- Which field contains the math that needs review
  field_name       TEXT NOT NULL DEFAULT 'question_text',
  -- Values: 'question_text' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'explanation'

  -- The original text exactly as stored in DB right now (never modified)
  original_text    TEXT NOT NULL,

  -- The AI/script suggested LaTeX replacement
  suggested_latex  TEXT,

  -- Admin can type a custom correction here
  admin_latex      TEXT,

  -- Which latex to actually apply on approve:
  --   final_latex = admin_latex if set, else suggested_latex
  final_latex      TEXT GENERATED ALWAYS AS (
    COALESCE(NULLIF(TRIM(admin_latex), ''), suggested_latex)
  ) STORED,

  -- Review workflow status
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),

  -- Source image URL that the original text replaced (optional, for reference)
  source_image_url TEXT,

  -- Notes from admin
  review_notes     TEXT,

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,

  -- Prevent duplicate entries for the same question+field
  CONSTRAINT math_review_unique_q_field UNIQUE (question_id, field_name)
);

-- Index for fast admin panel queries
CREATE INDEX IF NOT EXISTS math_review_status_idx    ON public.math_review (status);
CREATE INDEX IF NOT EXISTS math_review_paper_id_idx  ON public.math_review (paper_id);
CREATE INDEX IF NOT EXISTS math_review_created_idx   ON public.math_review (created_at DESC);

-- Enable Row Level Security (but allow service_role full access)
ALTER TABLE public.math_review ENABLE ROW LEVEL SECURITY;

-- Policy: service_role can do everything (used by Python scripts)
CREATE POLICY "service_role_all" ON public.math_review
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: authenticated users (admin panel) can read + update
CREATE POLICY "authenticated_read" ON public.math_review
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_update" ON public.math_review
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Verification query (run after creating to confirm)
-- SELECT COUNT(*) FROM public.math_review;
