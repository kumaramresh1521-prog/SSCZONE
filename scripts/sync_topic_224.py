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

with open('reasoning_analogy_155_questions_final.json', 'r', encoding='utf-8') as f:
    raw_questions = json.load(f)

# Also populate Topic 224 ('Analogy or Similarity' in SSC CGL Reasoning)
TARGET_TOPIC_ID = 224

rows_to_insert = []
for q in raw_questions:
    rows_to_insert.append({
        'topic_id': TARGET_TOPIC_ID,
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
total_inserted = 0
for i in range(0, len(rows_to_insert), chunk_size):
    chunk = rows_to_insert[i:i + chunk_size]
    data_bytes = json.dumps(chunk, ensure_ascii=False).encode('utf-8')
    insert_req = urllib.request.Request(f"{url}/rest/v1/questions", data=data_bytes, headers=headers, method='POST')
    with urllib.request.urlopen(insert_req) as resp:
        total_inserted += len(chunk)

print(f"Also synced all {total_inserted} questions into Topic {TARGET_TOPIC_ID} ('Analogy or Similarity')!")
