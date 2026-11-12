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

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
}

# Fetch 5 sample questions from Topic 242
req = urllib.request.Request(f"{url}/rest/v1/questions?topic_id=eq.242&limit=5&order=id.asc", headers=headers)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print(f"Fetched {len(data)} questions from Supabase topic 242:")
    for d in data:
        print(f"ID {d['id']}: {d['question_text']}")
        print(f"  A: {d['option_a']} | B: {d['option_b']} | C: {d['option_c']} | D: {d['option_d']}")
        print(f"  Ans: {d['correct_answer']} | ExamTag: {d['exam_tag']}")
        print(f"  Expl: {d['explanation'][:80]}...")
