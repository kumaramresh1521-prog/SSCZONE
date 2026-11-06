import requests
import json
import os
import sys

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

for pid in [6, 7, 19]:
    r = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&select=id,question_number,question_text,option_a&limit=5", headers=HEADERS)
    qs = r.json()
    print(f"\n--- Paper ID {pid} ---")
    for q in qs:
        print(f"Q.{q['question_number']}: {q['question_text'][:120]}...")
        print(f"  OptA: {q['option_a']}")
