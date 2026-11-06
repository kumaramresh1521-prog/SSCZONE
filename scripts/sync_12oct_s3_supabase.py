import json, sys, os, requests
sys.stdout.reconfigure(encoding='utf-8')

env = {}
with open(r'c:\ssczone\.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

json_path = r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-12-october-2026-shift-3.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

paper_id = 50

# First check what columns paper_questions has
resp = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?limit=1', headers=HEADERS)
print(f"Schema check: {resp.status_code}")
if resp.status_code == 200 and resp.json():
    print("Columns:", list(resp.json()[0].keys()))

print(f"\n=== SYNCING paper_id={paper_id} to paper_questions ===")

# Delete existing
del_resp = requests.delete(
    f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}',
    headers=HEADERS
)
print(f"DELETE: {del_resp.status_code}")
if del_resp.status_code not in [200, 204]:
    print(f"DELETE ERROR: {del_resp.text}")

# Insert all rows in chunks of 50
chunk_size = 50
total_inserted = 0

for i in range(0, len(data), chunk_size):
    chunk = data[i:i+chunk_size]
    rows = []
    for q in chunk:
        row = {
            'paper_id': paper_id,
            'question_number': q['question_number'],
            'question_text': q['question_text'],
            'option_a': q['option_a'],
            'option_b': q['option_b'],
            'option_c': q['option_c'],
            'option_d': q['option_d'],
            'correct_answer': q['correct_answer'],
        }
        # Add optional fields if they exist in schema
        if 'explanation' in q:
            row['explanation'] = q.get('explanation', '')
        if 'subject' in q:
            row['subject'] = q.get('subject', '')
        rows.append(row)
    
    ins_resp = requests.post(
        f'{SUPABASE_URL}/rest/v1/paper_questions',
        headers=HEADERS,
        json=rows
    )
    status = ins_resp.status_code
    if status in [200, 201]:
        total_inserted += len(rows)
        print(f"  Chunk {i//chunk_size+1}: OK ({len(rows)} rows)")
    else:
        print(f"  Chunk {i//chunk_size+1}: ERROR {status}")
        print(f"  Response: {ins_resp.text[:300]}")

print(f"\nTotal inserted: {total_inserted}/100")

# Verify
verify_resp = requests.get(
    f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}&select=question_number,question_text,option_a,option_b,option_c,option_d,correct_answer&limit=5',
    headers=HEADERS
)
if verify_resp.status_code == 200:
    rows = verify_resp.json()
    print(f"\nVerification - first 5 rows:")
    for r in rows[:3]:
        print(f"  Q.{r['question_number']}: {r['question_text'][:50]}...")

# Count total rows
count_resp = requests.get(
    f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}&select=id',
    headers={**HEADERS, 'Prefer': 'count=exact'}
)
print(f"\nTotal rows in DB for paper_id={paper_id}: {count_resp.headers.get('content-range', 'unknown')}")

print("\n=== DONE ===")
