import json

with open('all_expl_ocr_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

pages = set(l[0] for l in lines)
print("Pages in all_expl_ocr_lines:", sorted(list(pages)))
