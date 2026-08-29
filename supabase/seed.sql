-- Seed: Create your first admin user
-- 1. Sign up via the app at /signup
-- 2. Run this to make that user admin:
--
-- UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
--
-- Or insert sample data:

INSERT INTO exams (slug, title, description, sort_order) VALUES
('ssc-cgl', 'SSC CGL', 'Combined Graduate Level Examination', 1),
('ssc-chsl', 'SSC CHSL', 'Combined Higher Secondary Level', 2),
('ssc-gd', 'SSC GD', 'General Duty Constable', 3);
