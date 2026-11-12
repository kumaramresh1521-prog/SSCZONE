import json
import re

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Group lines by (file, col)
col_groups = {}
for idx, item in enumerate(lines):
    key = (item['file'], item['col'])
    if key not in col_groups:
        col_groups[key] = []
    col_groups[key].append((idx, item['text']))

print(f"Total columns: {len(col_groups)}")
for (fname, col), items in col_groups.items():
    # Find candidate question start lines
    cand_starts = []
    for idx, text in items:
        # Check if starts with a number or "Select"
        m = re.match(r'^[^\w]*(\d{1,3}|SL)\s*[\.\,\)\-]', text)
        if m and not re.match(r'^[\(\[]\s*[1-4]\s*[\)\]]', text) and not re.search(r'\d{2}\.\d{2}\.\d{4}', text):
            cand_starts.append((idx, text[:30]))
    print(f"{fname} col {col}: {len(items)} lines | {len(cand_starts)} candidates: {cand_starts[:3]} ... {cand_starts[-2:] if len(cand_starts) > 2 else []}")
