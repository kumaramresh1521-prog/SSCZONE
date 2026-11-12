import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Reconstruct cols
cols = []
cur_key = None
cur_list = []
for idx, item in enumerate(raw_lines):
    if idx >= 2599: break
    key = (item['file'], item['col'])
    if key != cur_key:
        if cur_list: cols.append((cur_key, cur_list))
        cur_key = key
        cur_list = []
    cur_list.append(item['text'])
if cur_list: cols.append((cur_key, cur_list))

with open('scripts/pdf_samples/t4_col_starts.json', 'r', encoding='utf-8') as f:
    col_starts_meta = json.load(f)

# Let's check which columns these questions belong to!
from collections import defaultdict
col_to_missing = defaultdict(list)

# Import parser logic
import sys
sys.path.append('scripts')
from test_robust_opt_parser import parse_options_from_chunk

for c_meta in col_starts_meta:
    c_idx = c_meta['c_idx']
    lines = cols[c_idx][1]
    starts = {int(k): v for k, v in c_meta['starts'].items()}
    q_start = c_meta['q_start']
    q_end = c_meta['q_end']
    
    for qn in range(q_start, q_end + 1):
        st = starts.get(qn, 0)
        en = starts.get(qn + 1, len(lines))
        chunk = lines[st:en]
        parsed = parse_options_from_chunk(chunk)
        if any(not o for o in parsed):
            col_to_missing[c_idx].append(qn)

print(f"Columns with missing options: {len(col_to_missing)} out of 41")
for c_idx, q_list in sorted(col_to_missing.items()):
    c_meta = col_starts_meta[c_idx]
    print(f"Col {c_idx} ({c_meta['fname']} col {c_meta['col_no']}): {len(q_list)} missing -> {q_list}")
