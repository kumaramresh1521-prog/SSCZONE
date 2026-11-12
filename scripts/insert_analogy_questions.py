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

# Load final questions
with open('reasoning_analogy_155_questions_final.json', 'r', encoding='utf-8') as f:
    raw_questions = json.load(f)

print(f"Loaded {len(raw_questions)} questions from reasoning_analogy_155_questions_final.json")

# Target topic: 242 (Analogy in Reasoning)
TARGET_TOPIC_ID = 242

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
        'exam_tag': None,  # User explicitly requested NO exam tag
        'difficulty': 'medium',
        'is_active': True,
        'tier_level': None
    })

# Check if any existing questions in topic 242
check_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&select=id&limit=1",
    headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
)
with urllib.request.urlopen(check_req) as resp:
    existing_count = resp.headers.get('Content-Range')
    print(f"Existing count in Topic {TARGET_TOPIC_ID}: {existing_count}")

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

print(f"\nSUCCESS: Successfully inserted all {total_inserted} questions into Topic {TARGET_TOPIC_ID} (Analogy - Reasoning)!")

# Verification: query count
verify_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&select=id&limit=1",
    headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
)
with urllib.request.urlopen(verify_req) as resp:
    final_count = resp.headers.get('Content-Range')
    print(f"Verified Final Content-Range in Topic {TARGET_TOPIC_ID}: {final_count}")

# Fetch first 2 questions from DB to verify persistence
sample_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&order=id.asc&limit=2",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(sample_req) as resp:
    sample_data = json.loads(resp.read().decode('utf-8'))
    print("\n=== SAMPLE QUESTIONS VERIFIED FROM DATABASE ===")
    for s in sample_data:
        print(f"ID: {s['id']} | Q: {s['question_text']}")
        print(f"   A: {s['option_a']} | B: {s['option_b']} | C: {s['option_c']} | D: {s['option_d']}")
        print(f"   Correct: {s['correct_answer']} | Exam Tag: {s['exam_tag']}")
        print(f"   Explanation: {s['explanation'][:100]}...")
