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

# Load final verified Type-I questions
with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    type1_questions = json.load(f)

print(f"Loaded {len(type1_questions)} Type-I questions from kiran_type1_284_verified.json")

TARGET_TOPIC_ID = 242

# Check if any Type-I questions already exist in topic 242
check_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&tier_level=eq.Type-I&select=id&limit=1",
    headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
)
with urllib.request.urlopen(check_req) as resp:
    existing_type1_count = resp.headers.get('Content-Range')
    print(f"Existing Type-I questions in Topic {TARGET_TOPIC_ID}: {existing_type1_count}")

# Prepare rows
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

print(f"\nSUCCESS: Successfully inserted all {total_inserted} Type-I questions into Topic {TARGET_TOPIC_ID}!")

# Verification: query count of Type-I
verify_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&tier_level=eq.Type-I&select=id&limit=1",
    headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
)
with urllib.request.urlopen(verify_req) as resp:
    final_type1_count = resp.headers.get('Content-Range')
    print(f"Verified Final Type-I Count in Topic {TARGET_TOPIC_ID}: {final_type1_count}")

# Fetch first 2 Type-I questions from DB to verify persistence
sample_req = urllib.request.Request(
    f"{url}/rest/v1/questions?topic_id=eq.{TARGET_TOPIC_ID}&tier_level=eq.Type-I&order=id.asc&limit=2",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(sample_req) as resp:
    sample_data = json.loads(resp.read().decode('utf-8'))
    print("\n=== SAMPLE QUESTIONS VERIFIED FROM SUPABASE DATABASE ===")
    print(json.dumps(sample_data, ensure_ascii=False, indent=2))
