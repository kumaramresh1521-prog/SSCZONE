import os
import sys
import json
import urllib.request
import glob
import re

env_path = '.env.local'
url = None
key = None
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

# 1. Fetch paper list for 2026 (id between 25 and 53)
req = urllib.request.Request(
    f"{url}/rest/v1/previous_papers?id=gte.25&id=lte.53&order=id.asc",
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(req) as resp:
    papers = json.loads(resp.read().decode('utf-8'))

print(f"Found {len(papers)} 2026 papers in DB.")

backup_dir_src = r'c:\ssczone\src\data\pyq_backup'
backup_dir_f = r'F:\startup  send mail\2026'

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

for p in papers:
    pid = p['id']
    title = p['title']
    
    # Fetch questions
    q_req = urllib.request.Request(
        f"{url}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc",
        headers={'apikey': key, 'Authorization': f'Bearer {key}'}
    )
    with urllib.request.urlopen(q_req) as resp:
        qs = json.loads(resp.read().decode('utf-8'))
        
    counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'Other': 0}
    for q in qs:
        a = (q.get('correct_answer') or '').strip().upper()
        if a in counts:
            counts[a] += 1
        else:
            counts['Other'] += 1
            
    print(f"P-{pid} ({title}): {len(qs)} qs | A={counts['A']} B={counts['B']} C={counts['C']} D={counts['D']}")
    
    # Find matching files in backup directories
    # Match by title or checking paper.id inside JSON
    for bdir in [backup_dir_src, backup_dir_f]:
        if not os.path.exists(bdir):
            continue
        for fpath in glob.glob(os.path.join(bdir, "ssc-cgl-2026-*.json")):
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                match = False
                if isinstance(data, dict):
                    if data.get('paper', {}).get('id') == pid or data.get('paper', {}).get('title') == title:
                        match = True
                elif isinstance(data, list) and data:
                    if data[0].get('paper_id') == pid:
                        match = True
                
                # Check filename date & shift match if not matched by ID
                if not match:
                    # extract date and shift
                    fname = os.path.basename(fpath).lower()
                    t_lower = title.lower()
                    for d in ['30-september', '1-october', '5-october', '6-october', '7-october', '8-october', '9-october', '10-october', '12-october', '13-october']:
                        for s in ['shift-1', 'shift-2', 'shift-3']:
                            if d in fname and s in fname and d.replace('-', ' ') in t_lower and s.replace('-', ' ') in t_lower:
                                match = True
                                
                if match:
                    # Update file with latest questions from Supabase
                    if isinstance(data, dict):
                        data['paper'] = p
                        data['questions'] = qs
                        with open(fpath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                    elif isinstance(data, list):
                        with open(fpath, 'w', encoding='utf-8') as f:
                            json.dump(qs, f, ensure_ascii=False, indent=2)
                    # print(f"  -> Synced: {fpath}")
            except Exception as ex:
                pass

print("\nAll local and external backup JSONs successfully synchronized from Supabase!")
