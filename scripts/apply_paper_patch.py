import os
import sys
import json
import urllib.request
import glob

# Load credentials
env_path = '.env.local'
url = None
key = None
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

def apply_patch(patch_path):
    print(f"Loading patch from {patch_path}...")
    with open(patch_path, 'r', encoding='utf-8') as f:
        patch = json.load(f)
    
    paper_id = patch['paper_id']
    changes = patch.get('changes', [])
    print(f"Paper {paper_id}: Found {len(changes)} changes to apply.")
    
    # 1. Update Supabase
    updated_count = 0
    for ch in changes:
        qid = ch.get('id')
        qnum = ch.get('question_number')
        new_ans = ch.get('new_answer')
        reason = ch.get('reason', '')
        
        # Build patch payload
        payload = { 'correct_answer': new_ans }
        # Only set explanation if reason is provided
        if reason:
            payload['explanation'] = reason
            
        data_bytes = json.dumps(payload).encode('utf-8')
        
        # Target by ID if present, otherwise by paper_id and question_number
        if qid:
            req_url = f"{url}/rest/v1/paper_questions?id=eq.{qid}"
        else:
            req_url = f"{url}/rest/v1/paper_questions?paper_id=eq.{paper_id}&question_number=eq.{qnum}"
            
        req = urllib.request.Request(req_url, data=data_bytes, headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }, method='PATCH')
        
        # Try up to 3 times in case of transient socket drop
        success = False
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req) as resp:
                    if resp.status in (200, 204):
                        updated_count += 1
                        success = True
                        break
            except Exception as e:
                if attempt == 2:
                    print(f"Error updating Q{qnum} (id={qid}): {e}")
                import time
                time.sleep(0.5)
            
    print(f"Successfully updated {updated_count}/{len(changes)} questions in Supabase.")
    
    # 2. Update local backup JSON files
    # Find matching JSON file in src/data/pyq_backup/
    backup_files = glob.glob(f"src/data/pyq_backup/ssc-cgl-2026-*.json")
    # Also find corresponding file in F:\startup  send mail\2026/
    f_files = glob.glob(r"F:\startup  send mail\2026\ssc-cgl-2026-*.json")
    
    # Map qnum -> new_ans
    change_map = {ch['question_number']: ch for ch in changes}
    
    # Query all questions for this paper from Supabase to get the fresh full state
    req_url = f"{url}/rest/v1/paper_questions?paper_id=eq.{paper_id}&order=question_number.asc"
    req = urllib.request.Request(req_url, headers={
        'apikey': key,
        'Authorization': f'Bearer {key}'
    })
    with urllib.request.urlopen(req) as resp:
        fresh_qs = json.loads(resp.read().decode('utf-8'))
        
    counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'Other': 0}
    for q in fresh_qs:
        a = (q.get('correct_answer') or '').strip().upper()
        if a in counts:
            counts[a] += 1
        else:
            counts['Other'] += 1
            
    print(f"New Answer Distribution for Paper {paper_id}: A={counts['A']}, B={counts['B']}, C={counts['C']}, D={counts['D']} (Total: {len(fresh_qs)})")
    
    # Update matching backup file in src/data/pyq_backup/
    paper_title = patch.get('title', '')
    # Match by paper title or id in slug
    for b_path in backup_files:
        try:
            with open(b_path, 'r', encoding='utf-8') as f:
                b_data = json.load(f)
            
            # Check if this file matches
            match = False
            if isinstance(b_data, dict):
                p_info = b_data.get('paper', {})
                if p_info.get('id') == paper_id or p_info.get('title') == paper_title:
                    match = True
            elif isinstance(b_data, list):
                # Check first question paper_id
                if b_data and b_data[0].get('paper_id') == paper_id:
                    match = True
                    
            if match:
                print(f"Updating local backup: {b_path}")
                if isinstance(b_data, dict):
                    b_data['questions'] = fresh_qs
                else:
                    b_data = fresh_qs
                with open(b_path, 'w', encoding='utf-8') as f:
                    json.dump(b_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error checking {b_path}: {e}")

    # Also update in F:\startup  send mail\2026/
    for f_path in f_files:
        try:
            with open(f_path, 'r', encoding='utf-8') as f:
                f_data = json.load(f)
            match = False
            if isinstance(f_data, dict):
                p_info = f_data.get('paper', {})
                if p_info.get('id') == paper_id or p_info.get('title') == paper_title:
                    match = True
            elif isinstance(f_data, list):
                if f_data and f_data[0].get('paper_id') == paper_id:
                    match = True
            if match:
                print(f"Updating F: backup: {f_path}")
                if isinstance(f_data, dict):
                    f_data['questions'] = fresh_qs
                else:
                    f_data = fresh_qs
                with open(f_path, 'w', encoding='utf-8') as f:
                    json.dump(f_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            pass

    print(f"Patch applied successfully for Paper {paper_id}.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python apply_paper_patch.py <path_to_patch.json>")
        sys.exit(1)
    apply_patch(sys.argv[1])
