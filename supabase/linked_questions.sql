-- ============================================================================
-- SSCZone: Master Question Bank & PYQ 2-Way Linking Migration
-- Run this in Supabase Dashboard -> SQL Editor (Optional but recommended)
-- ============================================================================

-- 1. Add foreign key link from questions (Question Bank) to paper_questions (PYQ Shift Papers)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS source_paper_question_id BIGINT REFERENCES public.paper_questions(id) ON DELETE SET NULL;

-- 2. Add foreign key link from paper_questions back to questions (Question Bank)
ALTER TABLE public.paper_questions 
ADD COLUMN IF NOT EXISTS question_bank_id BIGINT REFERENCES public.questions(id) ON DELETE SET NULL;

-- 3. Performance Indexes for instant 2-Way Sync queries (0ms lookups)
CREATE INDEX IF NOT EXISTS idx_questions_source_pq ON public.questions(source_paper_question_id);
CREATE INDEX IF NOT EXISTS idx_pq_qb_id ON public.paper_questions(question_bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_tag ON public.questions(exam_tag);
CREATE INDEX IF NOT EXISTS idx_questions_tier_level ON public.questions(tier_level);

-- 4. Comment annotations
COMMENT ON COLUMN public.questions.source_paper_question_id IS 'ID of the original PYQ shift question in paper_questions for 2-way sync';
COMMENT ON COLUMN public.paper_questions.question_bank_id IS 'ID of the mapped chapter question in questions for 2-way sync';
