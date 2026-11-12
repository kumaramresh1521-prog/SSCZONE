import json
import urllib.request
import urllib.error

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

print(f"Loaded {len(qs)} audited & verified Type-II questions.")

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

for target_topic_id in [224, 242]:
    print(f"\n--- Syncing Audited Type-II to Topic {target_topic_id} ---")
    
    # 1. Delete old Type-II rows
    del_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&tier_level=eq.Type-II",
        headers=headers,
        method='DELETE'
    )
    with urllib.request.urlopen(del_req) as resp:
        print(f"Deleted old Type-II rows in Topic {target_topic_id}")
        
    # 2. Insert audited 307 rows
    rows_to_insert = []
    for q in qs:
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
            
    print(f"Successfully inserted all {inserted} audited Type-II questions into Topic {target_topic_id}!")
    
    # 3. Verify exact counts
    for tier in ['Type-I', 'Type-II', 'Type-III']:
        req = urllib.request.Request(f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&tier_level=eq.{tier}&select=id&limit=1", headers={**headers, 'Prefer': 'count=exact'})
        with urllib.request.urlopen(req) as r:
            print(f"Topic {target_topic_id} - {tier}: {r.headers.get('Content-Range')}")
            
    # Total count in topic
    total_req = urllib.request.Request(f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&select=id&limit=1", headers={**headers, 'Prefer': 'count=exact'})
    with urllib.request.urlopen(total_req) as r:
        print(f"Topic {target_topic_id} - TOTAL: {r.headers.get('Content-Range')}")

print("\nAll Supabase topics successfully synced and verified for Batch 2!")
