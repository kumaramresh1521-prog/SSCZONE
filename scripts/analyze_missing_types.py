import json
import sys
sys.path.append('scripts')
from test_robust_opt_parser import parse_options_from_chunk, is_exam_line

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

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

missing_1 = []
missing_2 = []
missing_3_or_4 = []

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
        empty_count = sum(1 for o in parsed if not o)
        if empty_count == 1:
            missing_1.append((qn, parsed, chunk))
        elif empty_count == 2:
            missing_2.append((qn, parsed, chunk))
        elif empty_count >= 3:
            missing_3_or_4.append((qn, parsed, chunk))

print(f"Missing exactly 1 option: {len(missing_1)}")
print(f"Missing exactly 2 options: {len(missing_2)}")
print(f"Missing 3 or 4 options: {len(missing_3_or_4)}")
print("\nSample of missing exactly 1 option:")
for qn, parsed, chunk in missing_1[:10]:
    print(f"Q{qn}: parsed={parsed} | chunk_len={len(chunk)}")
    print(f"   chunk: {chunk}")
