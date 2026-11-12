import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

# Check Q54, Q82, Q104, Q138
for qtxt_fragment in ["L × M", "AHOP", "Stallion", "123 : 13²"]:
    # urlencode fragment
    encoded = urllib.parse.quote(f"%{qtxt_fragment}%")
    req = urllib.request.Request(f"{url}/rest/v1/questions?topic_id=eq.242&question_text=like.{encoded}", headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        for d in data:
            print(f"Matched '{qtxt_fragment}': {d['question_text']}")
            print(f"  A: {d['option_a']} | B: {d['option_b']} | C: {d['option_c']} | D: {d['option_d']}")
            print(f"  Ans: {d['correct_answer']} | Expl: {d['explanation']}")
            print()
