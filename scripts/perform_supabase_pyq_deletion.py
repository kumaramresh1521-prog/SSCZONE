import os
import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

env_path = '.env.local'
url = None
key = None
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

# Fetch target papers
req = urllib.request.Request(
    f"{url}/rest/v1/previous_papers?order=id.asc",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(req) as resp:
    all_papers = json.loads(resp.read().decode('utf-8'))

target_papers = [p for p in all_papers if str(p.get('year')) in ('2025', '2026') or (1 <= p.get('id', 0) <= 53)]
print(f"Targeting {len(target_papers)} papers for deletion from Supabase...")

# Step 1: Delete questions from paper_questions
print("Step 1: Deleting questions from paper_questions table...")
deleted_q_count = 0
for p in target_papers:
    pid = p['id']
    del_req = urllib.request.Request(
        f"{url}/rest/v1/paper_questions?paper_id=eq.{pid}",
        headers={'apikey': key, 'Authorization': f'Bearer {key}'},
        method='DELETE'
    )
    try:
        with urllib.request.urlopen(del_req) as resp:
            if resp.status in (200, 204):
                deleted_q_count += 1
    except Exception as e:
        print(f"  Error deleting questions for paper {pid}: {e}")

print(f"Successfully deleted questions for {deleted_q_count}/{len(target_papers)} papers.")

# Step 2: Delete papers from previous_papers table
print("Step 2: Deleting papers from previous_papers table...")
del_papers_req = urllib.request.Request(
    f"{url}/rest/v1/previous_papers?id=gte.1&id=lte.53",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'},
    method='DELETE'
)
try:
    with urllib.request.urlopen(del_papers_req) as resp:
        print(f"Delete previous_papers response: {resp.status}")
except Exception as e:
    print(f"Error deleting previous_papers: {e}")

# Step 3: Verify remaining records
print("\nStep 3: Verifying remaining records in Supabase...")
v1_req = urllib.request.Request(
    f"{url}/rest/v1/previous_papers?select=id,title,year",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(v1_req) as resp:
    remaining_papers = json.loads(resp.read().decode('utf-8'))

v2_req = urllib.request.Request(
    f"{url}/rest/v1/paper_questions?select=id&limit=10",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(v2_req) as resp:
    remaining_qs = json.loads(resp.read().decode('utf-8'))

print(f"Remaining papers in previous_papers: {len(remaining_papers)}")
print(f"Remaining questions in paper_questions: {len(remaining_qs)}")

if len(remaining_papers) == 0 and len(remaining_qs) == 0:
    print("\nSUCCESS! All 2025 and 2026 PYQ papers and questions have been completely removed from Supabase.")
else:
    print(f"\nNotice: Some records remain: Papers: {len(remaining_papers)}, Questions: {len(remaining_qs)}")
