import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))
url = env['NEXT_PUBLIC_SUPABASE_URL'].strip('\"\'')
key = env['SUPABASE_SERVICE_ROLE_KEY'].strip('\"\'')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

res = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.25&question_number=in.(1,3,10,50,88)&order=question_number.asc', headers=headers).json()
for q in res:
    print(f"=== Q.{q['question_number']} ===")
    print("TEXT:\n" + q['question_text'])
    print("Opt A:", repr(q['option_a']))
    print("Opt D:", repr(q['option_d']))
    print("-" * 50)
