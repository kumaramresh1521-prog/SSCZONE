import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('type3_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Find start of Type-III in explanations (line 106 was '1. (3)...')
start_idx = 106
expl_lines = lines[start_idx:]

def clean_expl_line(l):
    l = re.sub(r'K5279/\d+', '', l)
    l = re.sub(r'Search onTele.*', '', l)
    l = re.sub(r'@apna.*', '', l)
    return l.strip()

# Find all explanation headers
# E.g. "1. (3)", "23 (3)", "28, (4)", "42 (3)", "257. (1)"
header_regex = re.compile(r'^\s*(\d{1,3})\s*[\.\,\)]?\s*(?:\(([1-4])\)|\[([1-4])\]|\b([1-4])\b)(.*)')

header_matches = []
for idx, l in enumerate(expl_lines):
    cl = clean_expl_line(l)
    m = header_regex.match(cl)
    if m:
        q_num = int(m.group(1))
        ans_num = int(m.group(2) or m.group(3) or m.group(4))
        rest = m.group(5).strip()
        # Verify valid question range 1 to 257
        if 1 <= q_num <= 257:
            header_matches.append((idx, q_num, ans_num, rest))

print(f"Detected {len(header_matches)} header matches.")

# Group into question -> (ans, text)
expl_dict = {}
for i in range(len(header_matches)):
    idx, q_num, ans_num, rest = header_matches[i]
    next_idx = header_matches[i+1][0] if i + 1 < len(header_matches) else len(expl_lines)
    
    body_lines = [rest] if rest else []
    for k in range(idx + 1, next_idx):
        ck = clean_expl_line(expl_lines[k])
        if ck:
            body_lines.append(ck)
            
    full_text = '\n'.join(body_lines).strip()
    # Keep the latest or best match
    if q_num not in expl_dict or len(full_text) > len(expl_dict[q_num][1]):
        expl_dict[q_num] = (ans_num, full_text)

print(f"Total unique explanations parsed: {len(expl_dict)} / 257")
missing = [i for i in range(1, 258) if i not in expl_dict]
print(f"Missing count: {len(missing)}")
if missing:
    print(f"Missing numbers: {missing}")

with open('type3_parsed_explanations.json', 'w', encoding='utf-8') as f:
    json.dump({str(k): {'ans': v[0], 'text': v[1]} for k, v in expl_dict.items()}, f, ensure_ascii=False, indent=2)
