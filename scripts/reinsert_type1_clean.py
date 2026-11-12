import urllib.request
import urllib.error
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load Supabase credentials
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

TARGET_TOPIC_ID = 242

# 1. Delete previous Type-I rows in Topic 242
delete_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&tier_level=eq.Type-I",
    headers=headers,
    method='DELETE'
)
try:
    with urllib.request.urlopen(delete_req) as resp:
        print("Previous Type-I rows deleted cleanly.")
except urllib.error.HTTPError as e:
    print("Delete error:", e.code, e.read().decode('utf-8'))
    sys.exit(1)

# 2. Load 284 verified questions with real explanations
with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    type1_questions = json.load(f)

print(f"Loaded {len(type1_questions)} verified Type-I questions.")

rows_to_insert = []
for q in type1_questions:
    rows_to_insert.append({
        'topic_id': TARGET_TOPIC_ID,
        'question_text': q['question_text'],
        'option_a': q['option_a'],
        'option_b': q['option_b'],
        'option_c': q['option_c'],
        'option_d': q['option_d'],
        'correct_answer': q['correct_answer'],
        'explanation': q['explanation'],
        'exam_tag': q['exam_tag'],
        'difficulty': 'medium',
        'is_active': True,
        'tier_level': 'Type-I'
    })

# Insert in chunks of 50
chunk_size = 50
total_inserted = 0

for i in range(0, len(rows_to_insert), chunk_size):
    chunk = rows_to_insert[i:i + chunk_size]
    data_bytes = json.dumps(chunk, ensure_ascii=False).encode('utf-8')
    
    insert_req = urllib.request.Request(
        f"{url}/rest/v1/questions",
        data=data_bytes,
        headers=headers,
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(insert_req) as resp:
            total_inserted += len(chunk)
            print(f"Inserted chunk {i//chunk_size + 1}: {len(chunk)} questions (Total: {total_inserted}/{len(rows_to_insert)})")
    except urllib.error.HTTPError as e:
        print(f"Error on chunk {i//chunk_size + 1}: {e.code}")
        print("Response body:", e.read().decode('utf-8'))
        sys.exit(1)

print(f"\nSUCCESS: Successfully deployed all {total_inserted} Type-I questions into Topic {TARGET_TOPIC_ID}!")

# Verification: query count of Type-I
verify_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&tier_level=eq.Type-I&select=id&limit=1",
    headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
)
with urllib.request.urlopen(verify_req) as resp:
    final_type1_count = resp.headers.get('Content-Range')
    print(f"Verified Final Type-I Count in Topic {TARGET_TOPIC_ID}: {final_type1_count}")

# Fetch first 3 questions from DB to display
sample_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&tier_level=eq.Type-I&order=id.asc&limit=3",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(sample_req) as resp:
    sample_data = json.loads(resp.read().decode('utf-8'))
    print("\n=== VERIFIED SAMPLE FROM DATABASE ===")
    for sq in sample_data:
        print(f"ID {sq['id']}: {sq['question_text']}")
        print(f"Options: (A) {sq['option_a']} | (B) {sq['option_b']} | (C) {sq['option_c']} | (D) {sq['option_d']}")
        print(f"Ans: {sq['correct_answer']} | Tag: {sq['exam_tag']}")
        print(f"Expl: {sq['explanation'][:100]}...\n")
