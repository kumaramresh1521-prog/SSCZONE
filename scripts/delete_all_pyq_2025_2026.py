import os
import sys
import json
import urllib.request

env_path = '.env.local'
url = None
key = None
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

backup_dir = r'c:\ssczone\backup_before_delete_2025_2026'
os.makedirs(backup_dir, exist_ok=True)

# Step 1: Fetch all papers
print("Step 1: Fetching all 2025 and 2026 papers for safety backup...")
req = urllib.request.Request(
    f"{url}/rest/v1/previous_papers?order=id.asc",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(req) as resp:
    all_papers = json.loads(resp.read().decode('utf-8'))

target_papers = [p for p in all_papers if str(p.get('year')) in ('2025', '2026') or (1 <= p.get('id', 0) <= 53)]
print(f"Found {len(target_papers)} papers to backup and delete.")

# Save master papers list
with open(os.path.join(backup_dir, 'all_papers_meta.json'), 'w', encoding='utf-8') as f:
    json.dump(target_papers, f, ensure_ascii=False, indent=2)

# Step 2: Backup each paper's questions
print("Step 2: Backing up questions for all target papers...")
all_backup_data = []
for p in target_papers:
    pid = p['id']
    q_req = urllib.request.Request(
        f"{url}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc",
        headers={'apikey': key, 'Authorization': f'Bearer {key}'}
    )
    with urllib.request.urlopen(q_req) as resp:
        qs = json.loads(resp.read().decode('utf-8'))
    
    paper_dump = {
        "paper": p,
        "questions": qs
    }
    all_backup_data.append(paper_dump)
    
    # Save per-paper file
    fname = f"paper_{pid}_{p.get('year')}_{p.get('title')}.json".replace('/', '_').replace(':', '_').replace(' ', '_')
    with open(os.path.join(backup_dir, fname), 'w', encoding='utf-8') as f:
        json.dump(paper_dump, f, ensure_ascii=False, indent=2)
    print(f"  Backed up Paper {pid}: {len(qs)} questions.")

with open(os.path.join(backup_dir, 'full_snapshot_all_50_papers.json'), 'w', encoding='utf-8') as f:
    json.dump(all_backup_data, f, ensure_ascii=False)

print(f"\n✅ All {len(target_papers)} papers successfully backed up to {backup_dir}!\n")

# Step 3: Delete questions from paper_questions
print("Step 3: Deleting questions from paper_questions table in Supabase...")
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

# Step 4: Delete papers from previous_papers table
print("Step 4: Deleting papers from previous_papers table in Supabase...")
del_papers_req = urllib.request.Request(
    f"{url}/rest/v1/previous_papers?id=gte.1&id=lte.53",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'},
    method='DELETE'
)
try:
    with urllib.request.urlopen(del_papers_req) as resp:
        print(f"Delete previous_papers response: {resp.status}")
except Exception as e:
    print(f"Error deleting papers: {e}")

# Step 5: Verify remaining records
print("\nStep 5: Verifying remaining records in Supabase...")
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
    print("\n🎉 SUCCESS! All 2025 and 2026 PYQ papers and questions have been completely removed from Supabase.")
else:
    print(f"\n⚠️ Notice: Some records remain: Papers: {len(remaining_papers)}, Questions: {len(remaining_qs)}")
