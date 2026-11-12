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

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    type1_questions = json.load(f)

for target_topic_id in [224, 242]:
    print(f"\n--- Syncing Topic {target_topic_id} ---")
    
    # 1. Delete existing Type-I in this topic
    del_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&tier_level=eq.Type-I",
        headers=headers,
        method='DELETE'
    )
    with urllib.request.urlopen(del_req) as resp:
        print(f"Deleted old Type-I from Topic {target_topic_id}")
        
    # 2. Insert verified 284 questions
    rows_to_insert = []
    for q in type1_questions:
        rows_to_insert.append({
            'topic_id': target_topic_id,
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
            
    print(f"Successfully inserted {inserted} verified Type-I questions into Topic {target_topic_id}")
    
    # Count check
    count_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&select=id&limit=1",
        headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
    )
    with urllib.request.urlopen(count_req) as resp:
        print(f"Total questions in Topic {target_topic_id}: {resp.headers.get('Content-Range')}")

print("\nDatabase update completed successfully!")
