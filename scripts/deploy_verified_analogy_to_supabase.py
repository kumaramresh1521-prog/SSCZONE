import urllib.request
import urllib.error
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
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} verified questions.")

# 1. Clear prior rows in topics 242 and 224
for tid in [242, 224]:
    del_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{tid}",
        headers=headers,
        method='DELETE'
    )
    with urllib.request.urlopen(del_req) as resp:
        print(f"Cleared existing questions from Topic {tid}.")

# 2. Insert verified rows into Topic 242 (Analogy) and Topic 224 (Analogy or Similarity)
for tid in [242, 224]:
    rows = []
    for q in questions:
        rows.append({
            'topic_id': tid,
            'question_text': q['question_text'],
            'option_a': q['option_a'],
            'option_b': q['option_b'],
            'option_c': q['option_c'],
            'option_d': q['option_d'],
            'correct_answer': q['correct_answer'],
            'explanation': q['explanation'],
            'exam_tag': None,
            'difficulty': 'medium',
            'is_active': True,
            'tier_level': None
        })
        
    chunk_size = 50
    inserted = 0
    for i in range(0, len(rows), chunk_size):
        chunk = rows[i:i + chunk_size]
        data_bytes = json.dumps(chunk, ensure_ascii=False).encode('utf-8')
        req = urllib.request.Request(f"{url}/rest/v1/questions", data=data_bytes, headers=headers, method='POST')
        with urllib.request.urlopen(req) as resp:
            inserted += len(chunk)
            
    print(f"Successfully inserted {inserted} verified questions into Topic {tid}!")

# 3. Final verification of count
for tid in [242, 224]:
    v_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{tid}&select=id&limit=1",
        headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
    )
    with urllib.request.urlopen(v_req) as resp:
        print(f"Verified Supabase Content-Range for Topic {tid}: {resp.headers.get('Content-Range')}")
