import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Paper 44 Q.21
res44 = requests.get('http://localhost:3000/api/papers/questions?paperId=44').json()
for q in res44['questions']:
    if q['question_number'] == 21:
        print('=== Paper 44 (9 Oct S3) Q.21 ===')
        print('Text:', repr(q['question_text']))
        print('A:', repr(q['option_a']), 'B:', repr(q['option_b']), 'C:', repr(q['option_c']), 'D:', repr(q['option_d']))

# 2. Paper 53 Q.24 & Q.25
res53 = requests.get('http://localhost:3000/api/papers/questions?paperId=53').json()
for q in res53['questions']:
    if q['question_number'] in [24, 25]:
        print(f"=== Paper 53 (13 Oct S3) Q.{q['question_number']} ===")
        print('Text:', repr(q['question_text']))

# 3. Paper 27 (1 Oct S1) Math Q.69, Q.74
res27 = requests.get('http://localhost:3000/api/papers/questions?paperId=27').json()
for q in res27['questions']:
    if q['question_number'] in [69, 74]:
        print(f"=== Paper 27 (1 Oct S1) Q.{q['question_number']} ===")
        print('Text:', repr(q['question_text']))
