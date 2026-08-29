-- Question Error Reports & Feedback Table
CREATE TABLE IF NOT EXISTS question_reports (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_question_id ON question_reports(question_id);

-- Enable RLS
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anonymous users to submit reports
CREATE POLICY "Allow anyone to insert reports" ON question_reports
  FOR INSERT WITH CHECK (true);

-- Allow admins to view and update reports
CREATE POLICY "Allow service role full access to reports" ON question_reports
  FOR ALL USING (true);
