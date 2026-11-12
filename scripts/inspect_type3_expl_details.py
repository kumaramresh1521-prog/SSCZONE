import json
import re

with open('type3_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Page 51 right had the last few lines of Type-II before TYPE-III
# Let's find where '1. (3)' or TYPE-III starts
start_idx = 0
for idx, l in enumerate(lines[:100]):
    if 'TYPE-III' in l.upper() or re.match(r'^\s*1\s*[\.\)]\s*\(?3\)?', l):
        start_idx = idx
        break

print(f"Type-III explanation starts at line {start_idx}: '{lines[start_idx]}'")

# Let's parse all explanations
expls = {}
curr_q = None
curr_ans = None
curr_buf = []

for l in lines[start_idx:]:
    # Header pattern: e.g. "1. (3)", "2. (4)", "157. (1)", "257. (1)"
    m = re.match(r'^\s*(\d{1,3})\s*[\.\)]\s*(?:\(([1-4])\)|([1-4])\b)(.*)', l)
    if m:
        q_num = int(m.group(1))
        ans_num = int(m.group(2) or m.group(3))
        rest = m.group(4).strip()
        if 1 <= q_num <= 260:
            if curr_q is not None:
                expls[curr_q] = (curr_ans, '\n'.join(curr_buf).strip())
            curr_q = q_num
            curr_ans = ans_num
            curr_buf = [rest] if rest else []
            continue
    if curr_q is not None:
        curr_buf.append(l)

if curr_q is not None:
    expls[curr_q] = (curr_ans, '\n'.join(curr_buf).strip())

print(f"Total parsed explanations: {len(expls)} / 257")
missing = [i for i in range(1, 258) if i not in expls]
print(f"Missing explanation count: {len(missing)}")
if missing:
    print(f"Missing numbers: {missing}")
