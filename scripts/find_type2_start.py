import json

with open('all_expl_ocr_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for idx, (p, col, cy, txt) in enumerate(lines):
    if 'TYPE' in txt.upper() and ('II' in txt.upper() or '2' in txt):
        print(f"Line {idx}: [{p} {col} y={cy}] {txt}")
