import json
import re

with open('type3_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)[157:4859]

for q_num in [87, 165, 180, 181, 210, 234]:
    print(f"\n================ Q{q_num} ================")
    for idx, l in enumerate(lines):
        if re.match(rf'^\s*{q_num}\s*[\.\)]', l):
            for k in range(0, 22):
                if idx+k < len(lines):
                    print(f"  {lines[idx+k]}")
            break
