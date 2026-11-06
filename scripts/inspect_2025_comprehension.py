import requests
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

url = env['NEXT_PUBLIC_SUPABASE_URL'].strip('\"\'')
key = env['SUPABASE_SERVICE_ROLE_KEY'].strip('\"\'')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

# Get a 2025 paper
res25 = requests.get(f'{url}/rest/v1/previous_papers?year=eq.2025&limit=1', headers=headers).json()
p25_id = res25[0]['id']
# Get questions 75-80 and 95-100
q25 = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.{p25_id}&question_number=gte.74&question_number=lte.81&order=question_number.asc', headers=headers).json()

print(f"=== 2025 Comprehension Format for Paper {p25_id} ===")
for q in q25:
    print(f"Q.{q['question_number']}:")
    print("TEXT:", repr(q['question_text']))
    print("Opt A:", repr(q['option_a']))
    print("Opt D:", repr(q['option_d']))
    print("-" * 50)
