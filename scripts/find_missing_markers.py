import json
import re

with open('scripts/pdf_samples/t4_ordered_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Collect markers
markers = {}
for idx, line in enumerate(lines):
    # Skip after Q254
    if idx > 2600: continue
    if re.match(r'^[\(\[]\s*[1-4]\s*[\)\]]', line):
        continue
    if re.search(r'\d{2}\.\d{2}\.\d{4}', line):
        continue
    m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli]|SL)\s*[\.\,\)\-\:]\s*(.*)', line)
    if m:
        num_str = m.group(1).replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
        if num_str == 'SL': num_str = '51'
        if num_str.isdigit():
            val = int(num_str)
            if 1 <= val <= 254:
                if val not in markers:
                    markers[val] = (idx, line)

missing = [i for i in range(1, 255) if i not in markers]
print(f"Captured {len(markers)} / 254 unique question numbers.")
print(f"Missing {len(missing)} numbers: {missing}")
