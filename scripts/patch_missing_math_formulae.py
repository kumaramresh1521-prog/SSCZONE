import json
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
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# 1. Update Paper 6 Q53
p6_data = {
    "question_text": "Evaluate: 6 - [2/3 ÷ {1/6 + (1/2 × (1 - 1/3))}] मान ज्ञात कीजिए: 6 - [2/3 ÷ {1/6 + (1/2 × (1 - 1/3))}]",
    "option_a": "14/3",
    "option_b": "15/3",
    "option_c": "16/3",
    "option_d": "17/3",
    "correct_answer": "A",
    "explanation": "Using BODMAS:\n1) Innermost: 1 - 1/3 = 2/3\n2) Multiply: 1/2 × 2/3 = 1/3\n3) Add: 1/6 + 1/3 = 3/6 = 1/2\n4) Divide: 2/3 ÷ 1/2 = 4/3\n5) Subtract: 6 - 4/3 = (18 - 4)/3 = 14/3."
}
r1 = requests.patch(
    f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.6&question_number=eq.53",
    headers=HEADERS,
    json=p6_data
)
print("Updated Paper 6 Q53:", r1.status_code, r1.json())

# 2. Update Paper 53 Q51
p53_data = {
    "question_text": "Evaluate: 196² मान ज्ञात कीजिए: 196²",
    "option_a": "38496",
    "option_b": "38436",
    "option_c": "36466",
    "option_d": "38416",
    "correct_answer": "D",
    "explanation": "196² = (200 - 4)² = 200² - 2(200)(4) + 4² = 40000 - 1600 + 16 = 38416."
}
r2 = requests.patch(
    f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.53&question_number=eq.51",
    headers=HEADERS,
    json=p53_data
)
print("Updated Paper 53 Q51:", r2.status_code, r2.json())
