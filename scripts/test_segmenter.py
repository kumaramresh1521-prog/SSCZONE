import json
import re

with open('scripts/pdf_samples/t4_ordered_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Let's inspect all lines that could be question markers
potential_markers = []
for idx, line in enumerate(lines):
    # Match leading numbers or prompts
    m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli]|SL)\s*[\.\,\)\-\:]\s*(.*)', line)
    # Exclude options (1), (2), (3), (4)
    if re.match(r'^[\(\[]\s*[1-4]\s*[\)\]]', line):
        continue
    # Exclude dates like 17.03.2013
    if re.search(r'\d{2}\.\d{2}\.\d{4}', line):
        continue
    if m:
        num_str = m.group(1).replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
        if num_str == 'SL': num_str = '51'
        if num_str.isdigit():
            val = int(num_str)
            if 1 <= val <= 254:
                potential_markers.append((idx, val, line))

print(f"Total potential markers found: {len(potential_markers)}")
print("First 15 markers:", [(idx, val) for idx, val, line in potential_markers[:15]])
print("Last 15 markers:", [(idx, val) for idx, val, line in potential_markers[-15:]])
