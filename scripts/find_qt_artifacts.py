import requests
import json
import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

url = env['NEXT_PUBLIC_SUPABASE_URL'].strip('\"\'')
key = env['SUPABASE_SERVICE_ROLE_KEY'].strip('\"\'')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

res = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.25&order=question_number.asc', headers=headers).json()

print("--- Checking question_text in Paper 25 for header/footer artifacts ---")
for q in res:
    qn = q['question_number']
    qt = q['question_text'] or ""
    if re.search(r'(INTELLIGENCE|REASONING|AWARENESS|QUANTITATIVE|APTITUDE|ENGLISH\s+LANGUAGE|\bPAGE\b)', qt, re.I):
        print(f"Q.{qn} Text: {repr(qt)}")
