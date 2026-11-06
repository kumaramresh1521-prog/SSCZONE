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

# Fetch all questions for paper 25
res = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.25&order=question_number.asc', headers=headers).json()

print(f"Total questions in paper 25: {len(res)}")

# Check options with suspicious words or trailing digits or section headers
for q in res:
    qn = q['question_number']
    opts = {'A': q['option_a'], 'B': q['option_b'], 'C': q['option_c'], 'D': q['option_d']}
    for k, v in opts.items():
        if re.search(r'(INTELLIGENCE|REASONING|AWARENESS|QUANTITATIVE|ENGLISH|\b\d+\s+[A-Z]{3,})', v):
            print(f"Q.{qn} Opt {k}: {repr(v)}")
        elif re.search(r'\b[A-Za-z]+\s+\d+$', v.strip()):
            print(f"Q.{qn} Opt {k} (trailing number): {repr(v)}")
