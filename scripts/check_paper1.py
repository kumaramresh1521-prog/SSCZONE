import requests
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
HEADERS = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}

r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.1&order=question_number.asc', headers=HEADERS)
qs = r.json()
print(f"Paper 1: {len(qs)} questions")
for q in qs[:15]:
    print(f"\n[Q.{q['question_number']}]")
    print("  RAW: ", q['question_text'][:120])
    print("  OptA:", q['option_a'])
    print("  OptB:", q['option_b'])
