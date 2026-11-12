import json
import re

with open('type2_parsed_explanations.json', 'r', encoding='utf-8') as f:
    parsed = json.load(f)

with open('type2_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

existing = set(int(k) for k in parsed.keys())
missing = [i for i in range(1, 308) if i not in existing]
print(f"Total missing question numbers ({len(missing)}): {missing}")

# Search for these numbers in lines
for m in missing[:15]:
    found = []
    for idx, l in enumerate(lines):
        if re.search(rf'(?:^|\b|\D){m}\s*[\.\,\:\)]', l):
            found.append((idx, l))
    if found:
        print(f"\nMissing Q{m} matches:")
        for idx, l in found:
            snippet = " | ".join(lines[max(0, idx-1):min(len(lines), idx+3)])
            print(f"  Line {idx}: {snippet}")
