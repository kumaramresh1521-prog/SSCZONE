import json

with open('scripts/pdf_samples/t4_ordered_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Find Q30 and Q33
idx30 = None
idx33 = None
for idx, l in enumerate(lines):
    if '30.' in l: idx30 = idx
    if '33.' in l: idx33 = idx

print(f"Lines between Q30 ({idx30}) and Q33 ({idx33}):")
for i in range(idx30, idx33 + 1):
    print(f"  {i}: {lines[i]}")
