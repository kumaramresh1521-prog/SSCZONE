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

res25 = requests.get(f'{url}/rest/v1/previous_papers?year=eq.2025&limit=1', headers=headers).json()
p25_id = res25[0]['id']
q25 = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.{p25_id}&limit=20&order=question_number.asc', headers=headers).json()

print("--- 2025 Questions Analysis ---")
for q in q25:
    qt = q['question_text'] or ""
    has_newline = '\n' in qt
    num_newlines = qt.count('\n')
    print(f"Q.{q['question_number']} | newlines: {num_newlines} | len: {len(qt)}")
    if num_newlines > 0:
        print("   Lines:", repr(qt.split('\n')))
