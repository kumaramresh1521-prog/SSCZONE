import re

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
    
    # Intentional line break markers:
    # Lines starting with:
    # - 1. 2. 3. (numbered list)
    # - (i), (ii), (a), (b), (1), (2)
    # - a., b., c., d., A., B., C., D.
    # - Statements:, Conclusions:, कथन:, निष्कर्ष:
    # - (NOTE:, (Note:, NOTE:, Note:
    # - Analogy chains: RAT : IZG ...
    # - Triads / sets: (12, 4, 64) or 18, 23, ?, 41...
    # - Markdown images: ![Figure...
    # - First row:, Second row:, Third row:
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
            # Preserve empty line if output_lines not empty and last line not already empty
            if output_lines and output_lines[-1] != '':
                output_lines.append('')
            continue
            
        if not output_lines:
            output_lines.append(stripped)
            continue
            
        last_line = output_lines[-1]
        
        # If last line was empty, start new line
        if last_line == '':
            output_lines.append(stripped)
            continue
            
        # Check if this line is an intentional start
        if is_intentional_next.match(stripped):
            output_lines.append(stripped)
            continue
            
        # Check if last line ended with colon (e.g. "order of the following words:")
        if last_line.endswith(':') or last_line.endswith(':-'):
            output_lines.append(stripped)
            continue
            
        # Otherwise, this line is a mid-sentence soft wrap -> merge with space!
        output_lines[-1] = last_line + ' ' + stripped

    result = '\n'.join(output_lines)
    
    # Restore tables
    for idx, tbl in enumerate(tables):
        result = result.replace(f'___TABLE_TOKEN_{idx}___', tbl)
        
    # Clean up double blank lines
    result = re.sub(r'\n{3,}', '\n\n', result).strip()
    return result

import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

req = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.110&select=question_number,question_text&order=question_number.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())

print("Testing normalizer on all 100 questions of Paper 110:")
changed_count = 0
for q in data:
    orig = q['question_text'] or ''
    norm = normalize_question_text(orig)
    if orig != norm:
        changed_count += 1
        if q['question_number'] in [4, 8, 12, 13, 14, 25, 33, 41, 46, 52, 91, 96]:
            print(f"=== Q.{q['question_number']} ===")
            print("--- BEFORE ---")
            print(repr(orig))
            print("--- AFTER ---")
            print(repr(norm))
            print()

print(f"Total questions changed/cleaned in Paper 110: {changed_count} / {len(data)}")
