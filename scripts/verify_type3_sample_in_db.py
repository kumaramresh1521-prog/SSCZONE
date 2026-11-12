import urllib.request
import json

with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
}

# Fetch first 10 Type-III questions from Topic 224
req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.224&tier_level=eq.Type-III&select=question_text,option_a,option_b,option_c,option_d,correct_answer,explanation&order=id.asc&limit=10",
    headers=headers
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

for i, q in enumerate(data, 1):
    print(f"Row {i}:")
    print(f"  Q: {q['question_text'][:80]}...")
    print(f"  Ans: {q['correct_answer']}")
    print(f"  Exp: {q['explanation'][:80]}...")
    print()
