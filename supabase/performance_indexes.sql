-- SSCZone Database Performance Indexes
-- Run this script in Supabase SQL Editor to make all queries 10x - 100x faster!

-- 1) Foreign key index for Subjects by Exam
CREATE INDEX IF NOT EXISTS idx_subjects_exam_id ON subjects(exam_id);

-- 2) Foreign key index for Topics by Subject
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);

-- 3) Foreign key index for Questions by Topic and Activity
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_active ON questions(topic_id, is_active);

-- 4) Foreign key index for Previous Year Papers
CREATE INDEX IF NOT EXISTS idx_previous_papers_exam_id ON previous_papers(exam_id);
CREATE INDEX IF NOT EXISTS idx_previous_papers_active ON previous_papers(is_active);

-- 5) Foreign key index for Paper Questions
CREATE INDEX IF NOT EXISTS idx_paper_questions_paper_id ON paper_questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_questions_paper_qnum ON paper_questions(paper_id, question_number);

-- 6) User Subscriptions & Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_id ON user_answers(attempt_id);

-- Analyze tables for Query Planner optimization
ANALYZE exams;
ANALYZE subjects;
ANALYZE topics;
ANALYZE questions;
ANALYZE previous_papers;
ANALYZE paper_questions;
ANALYZE profiles;
ANALYZE packages;
ANALYZE subscriptions;
