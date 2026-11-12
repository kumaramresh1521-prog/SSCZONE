import json
import re

with open('type3_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)[106:]

with open('type3_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    q_lines = json.load(f)[157:4859]

# 1. First, find all question triad lines in q_lines to get signature numbers for every question
q_triads = {}
curr_q = 1
for idx, l in enumerate(q_lines):
    # Match patterns like (A, B, C)
    m = re.findall(r'\(\s*(\d{1,4})\s*[\,\.\s]\s*(\d{1,4})\s*[\,\.\s]\s*(\d{1,4})\s*\)', l)
    if m and curr_q <= 257:
        if curr_q not in q_triads:
            q_triads[curr_q] = m[0] # tuple of 3 numbers (n1, n2, n3)
    # Check if next question starts
    qm = re.match(r'^\s*(\d{1,3})\s*[\.\)]\s*(?:Select|Given|In|Two)', l)
    if qm:
        next_q = int(qm.group(1))
        if 1 <= next_q <= 257:
            curr_q = next_q

print(f"Extracted triads for {len(q_triads)} questions.")

# Now for each question from 1 to 257, let's locate its explanation in expl_lines!
found_map = {}

# Standard headers
header_regex = re.compile(r'^\s*(\d{1,3})\s*[\.\,\)]?\s*(?:\(([1-4])\)|\[([1-4])\]|\b([1-4])\b)(.*)')

for idx, l in enumerate(lines):
    m = header_regex.match(l)
    if m:
        qn = int(m.group(1))
        ans = int(m.group(2) or m.group(3) or m.group(4))
        if 1 <= qn <= 257 and qn not in found_map:
            found_map[qn] = (idx, ans)

# Check missing
missing = [i for i in range(1, 258) if i not in found_map]
print(f"Direct header matched {len(found_map)} questions. Missing: {len(missing)}")

# For missing, search by triads in lines
for mq in missing:
    triad = q_triads.get(mq)
    if triad:
        n1, n2, n3 = triad
        pattern = rf'{n1}.*{n2}.*{n3}'
        for idx, l in enumerate(lines):
            if re.search(pattern, l):
                # Look backwards up to 5 lines for header
                for b_idx in range(idx, max(-1, idx-5), -1):
                    bl = lines[b_idx]
                    hm = re.search(r'\(?([1-4])\)?', bl)
                    if hm:
                        ans = int(hm.group(1))
                        found_map[mq] = (b_idx, ans)
                        print(f"Matched missing Q{mq} by triad {triad} at line {b_idx}: '{bl}' -> Ans ({ans})")
                        break
                if mq in found_map:
                    break

final_missing = [i for i in range(1, 258) if i not in found_map]
print(f"Final missing questions count: {len(final_missing)}")
if final_missing:
    print(f"Remaining missing: {final_missing}")
