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

# Fetch specific updated questions by looking up their prompt text
for q_str in ['(37, 28, 333)', '(45, 37, 360)', '(11, 10, 21)', '(36, 21, 35)', '(8, 44, 224)']:
    req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.224&tier_level=eq.Type-III&question_text=like.*{urllib.parse.quote(q_str)}*&select=question_text,option_a,option_b,option_c,option_d,correct_answer,explanation",
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Matched {len(data)} rows for '{q_str}':")
        if data:
            print("  Q:", data[0]['question_text'][:70])
            print("  Ans:", data[0]['correct_answer'])
            print("  Exp:\n", data[0]['explanation'][:120])
        print()
