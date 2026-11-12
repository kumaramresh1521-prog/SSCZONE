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

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    type2_questions = json.load(f)

print(f"Loaded {len(type2_questions)} verified Type-II questions.")

for target_topic_id in [224, 242]:
    print(f"\n==========================================")
    print(f"--- Syncing Type-II to Topic {target_topic_id} ---")
    print(f"==========================================")
    
    # 1. Delete existing Type-II in this topic (if any)
    del_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&tier_level=eq.Type-II",
        headers=headers,
        method='DELETE'
    )
    with urllib.request.urlopen(del_req) as resp:
        print(f"Cleaned any existing Type-II from Topic {target_topic_id}")
        
    # 2. Insert verified 307 questions
    rows_to_insert = []
    for q in type2_questions:
        rows_to_insert.append({
            'topic_id': target_topic_id,
            'question_text': q['question_text'],
            'option_a': q['option_a'],
            'option_b': q['option_b'],
            'option_c': q['option_c'],
            'option_d': q['option_d'],
            'correct_answer': q['correct_option'],
            'explanation': q['explanation'],
            'exam_tag': q['exam_tag'],
            'difficulty': 'medium',
            'is_active': True,
            'tier_level': 'Type-II'
        })
        
    chunk_size = 50
    inserted = 0
    for i in range(0, len(rows_to_insert), chunk_size):
        chunk = rows_to_insert[i:i + chunk_size]
        data_bytes = json.dumps(chunk, ensure_ascii=False).encode('utf-8')
        
        insert_req = urllib.request.Request(
            f"{url}/rest/v1/questions",
            data=data_bytes,
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(insert_req) as resp:
            inserted += len(chunk)
            print(f"  Inserted {inserted}/{len(rows_to_insert)} questions...")
            
    print(f"Successfully inserted all {inserted} verified Type-II questions into Topic {target_topic_id}!")
    
    # 3. Exact count check
    count_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&select=id&limit=1",
        headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
    )
    with urllib.request.urlopen(count_req) as resp:
        print(f"Total questions in Topic {target_topic_id}: {resp.headers.get('Content-Range')}")

print("\nDatabase update for Batch 2 (Type-II: 307 questions) completed successfully!")
