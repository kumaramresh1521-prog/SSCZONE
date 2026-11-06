import json
import os
import sys
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

# Fetch first 10 questions of Paper 25
url = f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.25&order=question_number.asc&limit=10"
r = requests.get(url, headers=HEADERS)
data = r.json()
print(f"Total questions returned: {len(data)}")
for q in data:
    print(f"\n--- Q.{q['question_number']} (ID: {q['id']}) ---")
    print(f"Q: {q['question_text']}")
    print(f"A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}")
