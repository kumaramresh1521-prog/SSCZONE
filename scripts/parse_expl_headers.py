import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('all_expl_ocr_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

print(f"Total lines in OCR: {len(lines)}")

# Let's inspect lines that look like numbers
expl_items = []
current_q = None
current_ans = None
current_text = []

# Pattern to match: "1. (2)" or "15. (3)" or "105. (4)" or "10. (3)" or "io. (3)" etc.
header_pattern = re.compile(r'^(?:(?:\b|i|l|I)(\d{1,3})|([a-z]{1,2}))\s*[\.\)]\s*\(?([1-4])\)?(.*)', re.I)

for page, col, cy, line_txt in lines:
    txt = line_txt.strip()
    if 'TYPE-II' in txt:
        print(f"Reached TYPE-II at {page} {col}")
        # Stop or note boundary
    
    # Check if this line is an explanation header
    # e.g. "1. (2) Ass is considered..." or "1. (2)"
    m = re.match(r'^(?:[ilI]?(\d{1,3})|io)\s*[\.\)]\s*\(?([1-4])\)?(?:\s*(.*))?$', txt, re.I)
    if m:
        q_str = m.group(1)
        if not q_str:
            # Handle "io" as 10
            q_num = 10
        else:
            q_num = int(q_str)
            
        ans_num = int(m.group(2))
        rest = (m.group(3) or '').strip()
        
        expl_items.append({
            'page': page,
            'col': col,
            'q_num': q_num,
            'ans_num': ans_num,
            'rest': rest,
            'full_line': txt
        })

print(f"Found {len(expl_items)} explanation headers.")
for item in expl_items[:20]:
    print(f"Q{item['q_num']} -> Ans: {item['ans_num']} (from {item['page']}): {item['rest'][:40]}")
