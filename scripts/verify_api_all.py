import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')
res = requests.get('http://localhost:3000/api/papers/questions?paperId=50')
data = res.json().get('questions', [])
print(f"Fetched {len(data)} questions from API")
check_qns = [11, 14, 17, 19, 20, 21, 22, 24, 25, 29, 30, 31, 36, 37, 44, 54, 55, 56, 57, 58, 59, 60, 61, 62, 72, 74, 79, 83, 84, 88, 93, 96, 97, 98, 99, 100]

for q in sorted(data, key=lambda x: x['question_number']):
    qn = q['question_number']
    if qn in check_qns:
        qt = q['question_text'].replace('\n', ' ')
        print(f"--- Q.{qn} ---")
        print(f"QT: {qt[:130]}...")
        print(f"A: {q['option_a'][:40]} | B: {q['option_b'][:40]} | C: {q['option_c'][:40]} | D: {q['option_d'][:40]} | ANS: {q['correct_answer']}")
