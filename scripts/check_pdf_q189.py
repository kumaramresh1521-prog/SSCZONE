import json
import re

with open('type1_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for idx, l in enumerate(lines):
    if re.search(r'^\s*189[\.\,]', l):
        print(f"--- Line {idx}: {l} ---")
        for j in range(max(0, idx-5), min(len(lines), idx+15)):
            print(f"{j}: {lines[j]}")
