import json
import re

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Group by (file, col)
cols = {}
for idx, item in enumerate(lines):
    if idx >= 2599: break # Type-IV only
    key = (item['file'], item['col'])
    if key not in cols: cols[key] = []
    cols[key].append(item['text'])

print(f"Total columns in Type-IV: {len(cols)}")
for idx, (key, texts) in enumerate(cols.items()):
    # Find all explicit numbers in this column
    nums = []
    for t in texts:
        m = re.match(r'^[^\w]*([1-9]\d{0,2})\s*[\.\,\)\-]', t)
        if m and not re.match(r'^[\(\[]\s*[1-4]\s*[\)\]]', t) and not re.search(r'\d{2}\.\d{2}\.\d{4}', t):
            nums.append(int(m.group(1)))
    print(f"Col {idx:02d} ({key[0]} c{key[1]}): {len(texts)} lines | nums={nums}")
