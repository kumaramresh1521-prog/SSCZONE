import re
import os
import json

def replace_in_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return 0
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")
        return 1
    else:
        print(f"No changes in: {filepath}")
        return 0

# 1. src/data/seo-config.json
replace_in_file('src/data/seo-config.json', [
    (r'SSC Typing Speed Drill TCS Simulator', 'SSC Typing Speed Test TCS Simulator'),
    (r'Daily Free SSC Quiz Drill Online', 'Daily Free SSC Quiz & Mock Test Online'),
    (r'High-speed exam practice drill for SSC CGL', 'High-speed exam practice test for SSC CGL'),
    (r'25 Questions 15 Minutes Drill', '25 Questions 15 Minutes Speed Test'),
    (r'Daily Free Quiz Drill \| SSC CGL', 'Daily Free Quiz & Mock Test | SSC CGL'),
    (r'SSC Typing Test & Speed Drill Simulator', 'SSC Typing Test & Speed Practice Simulator'),
])

# 2. src/lib/seo-store.ts
replace_in_file('src/lib/seo-store.ts', [
    (r'SSC Typing Speed Drill TCS Simulator', 'SSC Typing Speed Test TCS Simulator'),
    (r'Daily Free SSC Quiz Drill Online', 'Daily Free SSC Quiz & Mock Test Online'),
])

# 3. src/app/admin/seo/page.tsx
replace_in_file('src/app/admin/seo/page.tsx', [
    (r'SSC Reasoning Verbal & Non-Verbal Drills', 'SSC Reasoning Verbal & Non-Verbal Practice Sets'),
    (r'Daily Free SSC Quiz Drill Online', 'Daily Free SSC Quiz & Mock Test Online'),
    (r'High-speed exam practice drill for SSC CGL', 'High-speed exam practice test for SSC CGL'),
    (r'25 Questions 15 Minutes Drill', '25 Questions 15 Minutes Speed Test'),
    (r'Daily Free Quiz Drill \(/daily-quiz\)', 'Daily Free Quiz & Mock Test (/daily-quiz)'),
    (r'Daily Free Quiz Drill \| SSC CGL', 'Daily Free Quiz & Mock Test | SSC CGL'),
    (r'SSC Typing Test & Speed Drill Simulator', 'SSC Typing Test & Speed Practice Simulator'),
])

# 4. src/app/speed-test/page.tsx
replace_in_file('src/app/speed-test/page.tsx', [
    (r'High-speed exam practice drill for SSC CGL', 'High-speed exam practice test for SSC CGL'),
])

# 5. src/app/speed-test/SpeedTestClient.tsx
replace_in_file('src/app/speed-test/SpeedTestClient.tsx', [
    (r'// Start Speed Test Drill', '// Start Speed Test'),
    (r'record your speed drill scorecards', 'record your speed test scorecards'),
    (r'// Fallback: try loading general subject drill', '// Fallback: try loading general subject test'),
    (r'"⏱️ Needs Speed Drills"', '"⏱️ Needs Speed Practice"'),
    (r'Mixed Rapid Drill', 'Mixed Rapid Test'),
    (r'<span className="text-slate-800 font-semibold">Speed Test Drill</span>', '<span className="text-slate-800 font-semibold">SSC Speed Test</span>'),
    (r'Real Exam Speed Drill', 'Real Exam Speed Test'),
    (r'Select Drill Mode', 'Select Test Mode'),
    (r'15 Mins Drill', '15 Mins Speed Test'),
    (r'Preparing Speed Drill\.\.\.', 'Preparing Speed Test...'),
    (r'Start Speed Drill', 'Start Speed Test'),
    (r'Submit Speed Drill\?', 'Submit Speed Test?'),
    (r'Continue Drill', 'Continue Test'),
    (r'Drill Completed', 'Test Completed'),
])

# 6. src/app/daily-quiz/page.tsx
replace_in_file('src/app/daily-quiz/page.tsx', [
    (r'Daily Free Quiz Drill \| SSC CGL', 'Daily Free Quiz & Mock Test | SSC CGL'),
])

# 7. src/app/daily-quiz/DailyQuizClient.tsx
replace_in_file('src/app/daily-quiz/DailyQuizClient.tsx', [
    (r'100% Free Daily Drills • Updated Every Single Day', '100% Free Daily Quizzes • Updated Every Single Day'),
    (r'Start Daily Drill', 'Start Daily Quiz'),
])

# 8. src/lib/daily-quiz-store.ts
replace_in_file('src/lib/daily-quiz-store.ts', [
    (r'Quantitative Aptitude Speed Drill', 'Quantitative Aptitude Practice Test'),
    (r'Reasoning & Intelligence Drill', 'Reasoning & Intelligence Practice Test'),
])

# 9. src/app/admin/daily-quiz/page.tsx
replace_in_file('src/app/admin/daily-quiz/page.tsx', [
    (r'Quantitative Aptitude Speed Drill', 'Quantitative Aptitude Practice Test'),
    (r'Reasoning & Intelligence Speed Drill', 'Reasoning & Intelligence Practice Test'),
    (r'English Comprehension Speed Drill', 'English Comprehension Practice Test'),
    (r'\(Speed Drill - 15 min\)', '(Speed Test - 15 min)'),
])

# 10. src/app/dashboard/page.tsx
replace_in_file('src/app/dashboard/page.tsx', [
    (r'<span className="text-xs font-bold text-slate-500">Total Drills</span>', '<span className="text-xs font-bold text-slate-500">Total Tests</span>'),
    (r'Tests & Drills Taken', 'Tests & Quizzes Taken'),
    (r'/\* SPEED DRILL & EXAM QUICK LAUNCH CARD \*/', '/* SPEED TEST & EXAM QUICK LAUNCH CARD */'),
    (r'TARGET DRILL: \{targetExam\}', 'TARGET TEST: {targetExam}'),
    (r'Tier-1 Sectional Weightage & Quick Drills', 'Tier-1 Sectional Weightage & Practice Tests'),
    (r'Start Drill &rarr;', 'Start Practice Test &rarr;'),
    (r'Take a 15-minute speed drill or daily quiz', 'Take a 15-minute speed test or daily quiz'),
    (r'⚡ Start Speed Drill', '⚡ Start Speed Test'),
    (r'\? "Speed Drill"', '? "Speed Test"'),
    (r'Official CPT 35 WPM drill', 'Official CPT 35 WPM practice test'),
])

# 11. src/app/dashboard/bookmarks/page.tsx
replace_in_file('src/app/dashboard/bookmarks/page.tsx', [
    (r'"speed_test" \? "Speed Drill"', '"speed_test" ? "Speed Test"'),
    (r'"Rapid Drill"', '"Speed Test"'),
])

# 12. src/app/practice/[topicId]/page.tsx
replace_in_file('src/app/practice/[topicId]/page.tsx', [
    (r'and timer drill\.', 'and timed practice.'),
])

# 13. src/app/practice/[topicId]/PracticeClient.tsx
replace_in_file('src/app/practice/[topicId]/PracticeClient.tsx', [
    (r'Loading Practice Drill\.\.\.', 'Loading Practice Questions...'),
])

# 14. src/app/syllabus/page.tsx
replace_in_file('src/app/syllabus/page.tsx', [
    (r'50\+ PYQ drills', '50+ PYQ practice tests'),
])

# 15. src/app/syllabus/SyllabusTrackerClient.tsx
replace_in_file('src/app/syllabus/SyllabusTrackerClient.tsx', [
    (r'title="Launch direct PYQ Speed Test drill on this topic"', 'title="Launch direct PYQ Speed Test on this topic"'),
    (r'<span>Drill</span>', '<span>Test</span>'),
])

# 16. src/app/typing/layout.tsx
replace_in_file('src/app/typing/layout.tsx', [
    (r'SSC Typing Test & Speed Drill Simulator', 'SSC Typing Test & Speed Practice Simulator'),
])

# 17. src/components/Footer.tsx
replace_in_file('src/components/Footer.tsx', [
    (r'>Speed Drills<', '>Speed Tests<'),
])

# 18. src/app/blog/notes/ChapterNotesReaderClient.tsx
replace_in_file('src/app/blog/notes/ChapterNotesReaderClient.tsx', [
    (r'Start Chapter Drill →', 'Start Practice Test →'),
])

# 19. src/app/admin/session-gate/page.tsx
replace_in_file('src/app/admin/session-gate/page.tsx', [
    (r'Speed tests & CBT drills blocked', 'Speed tests & CBT mock tests blocked'),
])

# 20. src/app/api/speed-test/questions/route.ts
replace_in_file('src/app/api/speed-test/questions/route.ts', [
    (r'"Chapter Drill"', '"Chapter Practice Set"'),
    (r'\$\{SUBJECT_NAMES\[resolvedSubjectKey\]\} Drill', '${SUBJECT_NAMES[resolvedSubjectKey]} Practice Set'),
])

# 21. src/data/daily_quizzes.json
replace_in_file('src/data/daily_quizzes.json', [
    (r'Shift Drill', 'Practice Test'),
])

# 22. src/data/chapter_notes.json
replace_in_file('src/data/chapter_notes.json', [
    (r'Error-Spotting Drills', 'Error-Spotting Practice Examples'),
    (r'Error-spotting Drills', 'Error-spotting Practice Examples'),
    (r'Exam Drills', 'Exam Practice Questions'),
    (r'exam drills', 'exam practice questions'),
    (r'Practice Drills', 'Practice Questions'),
    (r'practice drills', 'practice questions'),
    (r'Practice Drill', 'Practice Set'),
    (r'practice drill', 'practice set'),
])

print("Finished replacing non-SEO drill terms!")
