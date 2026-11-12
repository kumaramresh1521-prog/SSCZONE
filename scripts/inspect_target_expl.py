import json
import re

with open('type2_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for target in [39, 83, 84, 85, 86, 173]:
    print(f"=== TARGET Q{target} ===")
    for idx, l in enumerate(lines):
        # Search for target number
        if re.search(rf'\b{target}\b', l):
            print(f"  Line {idx}: {l}")
