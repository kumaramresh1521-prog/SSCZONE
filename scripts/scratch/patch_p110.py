import sys, re
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

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

# Test on Paper 110: fetch questions, calculate updates, patch DB
req = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.110&select=id,question_number,question_text&order=question_number.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())

updates = []
for q in data:
    orig = q['question_text'] or ''
    norm = normalize_question_text(orig)
    if orig != norm:
        updates.append((q['id'], q['question_number'], norm))

print(f"Paper 110: {len(updates)} of {len(data)} questions will be updated.")

# Batch update
success_count = 0
for q_id, q_no, new_text in updates:
    payload = json.dumps({'question_text': new_text}).encode('utf-8')
    patch_req = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?id=eq.{q_id}',
        data=payload,
        headers={
            'apikey': k,
            'Authorization': f'Bearer {k}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        method='PATCH'
    )
    try:
        with urllib.request.urlopen(patch_req) as r:
            success_count += 1
    except Exception as e:
        print(f"Failed to update Q.{q_no} (id={q_id}): {e}")

print(f"Successfully updated {success_count} questions in Paper 110!")
