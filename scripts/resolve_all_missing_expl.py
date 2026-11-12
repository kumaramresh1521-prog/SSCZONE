import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('type2_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    all_lines = json.load(f)

lines = all_lines[70:2258]
full_text = '\n' + '\n'.join(lines)

# Initial parse
pattern = re.compile(r'(?:^|\n|\s)(?:[ilI]?(\d{1,3})|io)\s*[\.\,\、\)]?\s*\(?([1-4])\)(?:\s*(.*))?')
matches = list(pattern.finditer(full_text))

found_qs = {}
for m in matches:
    q_str = m.group(1)
    q_num = 10 if not q_str else int(q_str)
    ans = int(m.group(2))
    if 1 <= q_num <= 307:
        if q_num not in found_qs:
            found_qs[q_num] = []
        found_qs[q_num].append((ans, m.start(), m.end(), m.group(0)))

missing = [i for i in range(1, 308) if i not in found_qs]
print(f"Missing count: {len(missing)}")
print("Missing:", missing)

# For each missing, find the text between the preceding question and succeeding question
for m in missing:
    prev = m - 1
    while prev > 0 and prev not in found_qs:
        prev -= 1
    nxt = m + 1
    while nxt <= 307 and nxt not in found_qs:
        nxt += 1
    
    prev_end = found_qs[prev][0][2] if prev in found_qs else 0
    nxt_start = found_qs[nxt][0][1] if nxt in found_qs else len(full_text)
    
    gap = full_text[prev_end:nxt_start].strip()
    print(f"\n==================== Q{m} (between Q{prev} and Q{nxt}) ====================")
    print(gap)
