import json
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

# Fetch questions with images
url = f"{SUPABASE_URL}/rest/v1/paper_questions?question_text=like.*image*&limit=50"
r = requests.get(url, headers=HEADERS)
data = r.json()
print(f"Found {len(data)} questions with 'image' in question_text")
for q in data[:10]:
    print(f"\nID: {q['id']}, Paper: {q['paper_id']}, Q.{q['question_number']}")
    print(f"Text: {q['question_text']}")
    print(f"Options: A:{q['option_a']}, B:{q['option_b']}")

# Also check for markdown ![] in options or question_text
url2 = f"{SUPABASE_URL}/rest/v1/paper_questions?option_a=like.*image*&limit=10"
r2 = requests.get(url2, headers=HEADERS)
data2 = r2.json()
print(f"\nFound {len(data2)} questions with 'image' in option_a")
for q in data2[:5]:
    print(f"\nID: {q['id']}, Paper: {q['paper_id']}, Q.{q['question_number']}")
    print(f"Option A: {q['option_a']}")
