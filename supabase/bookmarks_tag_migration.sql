-- Optional label used by the saved-questions filter.
-- Safe to run more than once in the Supabase SQL Editor.
ALTER TABLE public.bookmarks
ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT 'Revision';
