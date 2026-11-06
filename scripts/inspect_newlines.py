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

res = requests.get(f'{url}/rest/v1/paper_questions?select=question_number,question_text,option_a,option_b,option_c,option_d&paper_id=eq.25&limit=20&order=question_number.asc', headers=headers).json()
for q in res:
    print(f"=== Q.{q['question_number']} ===")
    print("RAW:")
    print(repr(q['question_text']))
    print("DISPLAYED:")
    print(q['question_text'])
    print("OPTIONS:")
    print("A:", repr(q['option_a']))
    print("B:", repr(q['option_b']))
    print("C:", repr(q['option_c']))
    print("D:", repr(q['option_d']))
    print("-" * 50)
