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

r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?question_text=like.*%3Cimg*&select=id,paper_id,question_number,question_text', headers=HEADERS)
data = r.json()
print("Questions with <img:", len(data))
for item in data[:5]:
    print(f"Paper {item['paper_id']} Q.{item['question_number']}: {item['question_text'][:80]}")
