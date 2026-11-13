-- ============================================================
-- Math Review Table — SSCZone
-- Run this in Supabase SQL Editor (safe — creates new table only)
-- Does NOT touch any existing tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.math_review (
  id               BIGSERIAL PRIMARY KEY,
  question_id      BIGINT NOT NULL,
  paper_id         BIGINT NOT NULL,
  question_number  INTEGER,
  field_name       TEXT NOT NULL DEFAULT 'question_text',
  original_text    TEXT NOT NULL,
  suggested_latex  TEXT,
  admin_latex      TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  source_image_url TEXT,
  review_notes     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  CONSTRAINT math_review_unique_q_field UNIQUE (question_id, field_name)
);

CREATE INDEX IF NOT EXISTS math_review_status_idx    ON public.math_review (status);
CREATE INDEX IF NOT EXISTS math_review_paper_id_idx  ON public.math_review (paper_id);
CREATE INDEX IF NOT EXISTS math_review_created_idx   ON public.math_review (created_at DESC);

ALTER TABLE public.math_review ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.math_review
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read" ON public.math_review
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_update" ON public.math_review
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
