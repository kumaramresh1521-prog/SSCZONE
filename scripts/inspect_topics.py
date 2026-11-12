import os
import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

# Get exams
req = urllib.request.Request(f'{url}/rest/v1/exams', headers=headers)
with urllib.request.urlopen(req) as resp:
    exams = {e['id']: e for e in json.loads(resp.read().decode('utf-8'))}

# Get subjects
req = urllib.request.Request(f'{url}/rest/v1/subjects', headers=headers)
with urllib.request.urlopen(req) as resp:
    subjects = {s['id']: s for s in json.loads(resp.read().decode('utf-8'))}

# Get topics
req = urllib.request.Request(f'{url}/rest/v1/topics', headers=headers)
with urllib.request.urlopen(req) as resp:
    topics = json.loads(resp.read().decode('utf-8'))

print('=== ALL REASONING SUBJECTS ===')
for sid, s in subjects.items():
    title = s.get('title') or ''
    if any(k in title.lower() for k in ['reason', 'intelligence', 'gi']):
        exam = exams.get(s['exam_id'], {})
        print(f"Subject ID: {sid} | Title: {title} | Exam: {exam.get('title')} ({exam.get('slug')})")

print('\n=== ALL ANALOGY TOPICS ===')
for t in topics:
    title = t.get('title') or ''
    if 'analogy' in title.lower():
        subj = subjects.get(t['subject_id'], {})
        exam = exams.get(subj.get('exam_id'), {})
        print(f"Topic ID: {t['id']} | Title: {title} | Subject: {subj.get('title')} (ID: {t['subject_id']}) | Exam: {exam.get('title')}")

# Also check columns of questions table
req = urllib.request.Request(f'{url}/rest/v1/questions?limit=1', headers=headers)
with urllib.request.urlopen(req) as resp:
    q_rows = json.loads(resp.read().decode('utf-8'))
    print('\n=== questions Table Columns ===')
    if q_rows:
        print(list(q_rows[0].keys()))
        print(q_rows[0])
