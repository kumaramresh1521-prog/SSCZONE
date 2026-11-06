import json
import os
import sys
import requests
import fitz

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

# Check Paper 6 (16 Sept 2025 Shift 1) in database
r = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.6&question_number=lte.5&order=question_number.asc", headers=HEADERS)
p6_data = r.json()
print("=== DATABASE: Paper 6 (16 Sept 2025 Shift 1) ===")
for q in p6_data:
    print(f"\nQ.{q['question_number']}:")
    print("DB Text:", q['question_text'])
    print("DB OptA:", q['option_a'])

# Check Paper 27 (1 Oct 2026 Shift 1) in database
r2 = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.27&question_number=lte.5&order=question_number.asc", headers=HEADERS)
p27_data = r2.json()
print("\n=== DATABASE: Paper 27 (1 Oct 2026 Shift 1) ===")
for q in p27_data:
    print(f"\nQ.{q['question_number']}:")
    print("DB Text:", q['question_text'])
    print("DB OptA:", q['option_a'])
