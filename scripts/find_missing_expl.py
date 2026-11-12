import json
import re

with open('all_284_expl_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

missing = [36, 62, 69, 73, 74, 75, 83, 103, 133, 148, 150, 152, 153, 154, 161, 162, 163, 166, 169, 173, 174, 177, 203, 205, 209, 222, 223, 225, 232, 234, 277]

for m_num in missing:
    found = []
    for idx, l in enumerate(lines):
        # Look for the number at beginning of line or after punctuation
        if re.search(rf'(?:^|\b|\D){m_num}\s*[\.\,\:\)]', l):
            found.append((idx, l))
    if found:
        print(f"--- Missing Q{m_num} matches ---")
        for idx, l in found:
            # show surrounding lines
            snippet = " | ".join(lines[max(0, idx-1):min(len(lines), idx+3)])
            print(f"Line {idx}: {snippet}")
    else:
        print(f"Q{m_num}: Not found by simple regex")
