import os
import sys
import re
import requests

sys.stdout.reconfigure(encoding='utf-8')

env = {}
with open(r'c:\ssczone\.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Fetch all questions with images
url = f"{SUPABASE_URL}/rest/v1/paper_questions?question_text=like.*images*&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d&order=id.asc"
r = requests.get(url, headers=HEADERS)
data = r.json()
print(f"Total questions with images in question_text: {len(data)}")

url_opts = f"{SUPABASE_URL}/rest/v1/paper_questions?option_a=like.*images*&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d&order=id.asc"
r_opts = requests.get(url_opts, headers=HEADERS)
data_opts = r_opts.json()
print(f"Total questions with images in option_a: {len(data_opts)}")

for q in data[:5]:
    print(f"\nPaper {q['paper_id']} Q.{q['question_number']}:")
    print("Q:", q['question_text'])
    print("A:", q['option_a'])
    print("B:", q['option_b'])

for q in data_opts[:5]:
    print(f"\n[Opt Image] Paper {q['paper_id']} Q.{q['question_number']}:")
    print("Q:", q['question_text'])
    print("A:", q['option_a'])
    print("B:", q['option_b'])
