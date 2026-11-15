import sys, re, time
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json
from concurrent.futures import ThreadPoolExecutor, as_completed

u, k = get_supabase_credentials()

def normalize_question_text(raw: str) -> str:
    if not raw or not raw.strip():
        return raw or ""
    
    t = raw.replace('\r\n', '\n').replace('\r', '\n')
    
    # If the text has markdown table, separate it out
    table_regex = re.compile(r'(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\n|$)){2,}', re.MULTILINE)
    tables = []
    def save_table(m):
        tables.append(m.group(0).strip())
        return f'\n\n___TABLE_TOKEN_{len(tables)-1}___\n\n'
    
    t_no_tables = table_regex.sub(save_table, t)
    
    # Intentional line break markers
    intentional_patterns = [
        r'^\s*\d+[\.\)]\s+',                         # 1. 2.
        r'^\s*\([a-zA-Z0-9ivxIVX]+\)\s*',             # (i) (a) (1)
        r'^\s*[a-dA-D][\.\)]\s+',                     # a. b. A. B.
        r'^\s*(?:Statements?|Conclusions?|कथन|निष्कर्ष)\b',
        r'^\s*\(?(?:NOTE|Note)\s*[:\-]',              # (NOTE:
        r'^\s*[A-Z0-9\s]{2,}:[^:]+::',                # RAT : IZG ...
        r'^\s*\(?\s*\d+\s*,\s*\d+\s*,\s*(?:\?|\d+)',  # (12, 4, 64) or 18, 23, ?
        r'^\s*\d+\s*[-–]\s*\d+\s*[-–]\s*\d+',         # 8-17-35
        r'^\s*![\[\(]',                                # images
        r'^\s*<img\b',                                 # img
        r'^\s*___TABLE_TOKEN_',                        # table
        r'^\s*(?:First|Second|Third|Fourth)\s+row\b',  # First row:
        r'^\s*Row\s+\d+\b',                           # Row 1:
        r'^\s*["“\']?[A-Z]\s*[+\-×÷x*]\s*[A-Z]',      # "A + B' means
        r'^\s*MAL_[A-Z0-9_]+',                        # reasoning blanks
        r'^\s*(?:Passage|Directions?)\b',              # Comprehension directions
    ]
    is_intentional_next = re.compile('|'.join(intentional_patterns), re.IGNORECASE)
    
    lines = t_no_tables.split('\n')
    output_lines = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if output_lines and output_lines[-1] != '':
                output_lines.append('')
            continue
            
        if not output_lines:
            output_lines.append(stripped)
            continue
            
        last_line = output_lines[-1]
        
        if last_line == '':
            output_lines.append(stripped)
            continue
            
        if is_intentional_next.match(stripped):
            output_lines.append(stripped)
            continue
            
        if last_line.endswith(':') or last_line.endswith(':-'):
            output_lines.append(stripped)
            continue
            
        # Otherwise, this line is a mid-sentence soft wrap -> merge with space!
        output_lines[-1] = last_line + ' ' + stripped

    result = '\n'.join(output_lines)
    
    for idx, tbl in enumerate(tables):
        result = result.replace(f'___TABLE_TOKEN_{idx}___', tbl)
        
    result = re.sub(r'\n{3,}', '\n\n', result).strip()
    return result

def patch_single_question(item):
    q_id, q_num, norm_text = item
    patch_data = json.dumps({'question_text': norm_text}).encode('utf-8')
    patch_req = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?id=eq.{q_id}',
        data=patch_data,
        headers={
            'apikey': k,
            'Authorization': f'Bearer {k}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        method='PATCH'
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(patch_req, timeout=15) as resp:
                if resp.status in (200, 204):
                    return True
        except Exception as e:
            time.sleep(0.5 * (attempt + 1))
            if attempt == 2:
                print(f"Failed to patch ID {q_id}: {e}", flush=True)
                return False
    return False

def fetch_paper_questions(paper_id: int):
    req = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=eq.{paper_id}&select=id,question_number,question_text&order=question_number.asc',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())

if __name__ == '__main__':
    paper_ids = list(range(94, 133))
    print(f"Fetching questions for {len(paper_ids)} papers (IDs 94 to 132)...", flush=True)
    
    all_updates = []
    total_q_count = 0
    
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_paper_questions, pid): pid for pid in paper_ids}
        for future in as_completed(futures):
            pid = futures[future]
            try:
                questions = future.result()
                total_q_count += len(questions)
                paper_updates = 0
                for q in questions:
                    orig = q['question_text'] or ''
                    norm = normalize_question_text(orig)
                    if orig != norm:
                        all_updates.append((q['id'], q['question_number'], norm))
                        paper_updates += 1
                print(f"Paper {pid}: {paper_updates} of {len(questions)} questions queued for normalization.", flush=True)
            except Exception as e:
                print(f"Error fetching paper {pid}: {e}", flush=True)

    print(f"\nTotal updates to apply: {len(all_updates)} across {total_q_count} questions.", flush=True)
    
    if not all_updates:
        print("Nothing to update! All papers are already normalized.", flush=True)
        sys.exit(0)
        
    print(f"Applying updates concurrently with 10 workers...", flush=True)
    success_count = 0
    t0 = time.time()
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(patch_single_question, item) for item in all_updates]
        for idx, future in enumerate(as_completed(futures), 1):
            if future.result():
                success_count += 1
            if idx % 200 == 0 or idx == len(all_updates):
                print(f"Progress: {idx}/{len(all_updates)} patched ({success_count} succeeded)...", flush=True)
                
    elapsed = time.time() - t0
    print(f"\nCOMPLETED! Successfully patched {success_count}/{len(all_updates)} questions in {elapsed:.1f}s.", flush=True)
