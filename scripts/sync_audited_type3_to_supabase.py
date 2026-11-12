import json
import urllib.request
import urllib.error

with open('kiran_type3_257_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

print(f"Loaded {len(qs)} audited & verified Type-III questions.")

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
    print(f"\n--- Syncing Audited Type-III to Topic {target_topic_id} ---")
    
    # 1. Delete old Type-III rows
    del_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&tier_level=eq.Type-III",
        headers=headers,
        method='DELETE'
    )
    with urllib.request.urlopen(del_req) as resp:
        print(f"Deleted old Type-III rows in Topic {target_topic_id}")
        
    # 2. Insert audited 257 rows
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
            'tier_level': 'Type-III'
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
            
    print(f"Successfully inserted all {inserted} audited Type-III questions into Topic {target_topic_id}!")
    
    # 3. Verify total count and breakdown
    req = urllib.request.Request(f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&select=tier_level", headers={'apikey': key, 'Authorization': f'Bearer {key}'})
    data = json.loads(urllib.request.urlopen(req).read())
    t1 = sum(1 for d in data if d.get('tier_level') == 'Type-I')
    t2 = sum(1 for d in data if d.get('tier_level') == 'Type-II')
    t3 = sum(1 for d in data if d.get('tier_level') == 'Type-III')
    print(f"Topic {target_topic_id}: Total = {len(data)} (Type-I: {t1}, Type-II: {t2}, Type-III: {t3})")

print("\nAll Supabase topics successfully synced and verified!")
