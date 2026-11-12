import json
import re

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

def parse_opts(lines):
    opts = {}
    for l in lines:
        matches = re.finditer(r'(?:[\(\[]\s*([1-4Ili])\s*[\)\]\s]|(?:^|\s)([1-4])\s*[\)\]\.\s])\s*([A-Za-z0-9\s\:\;\,\#\%\-\_\?\~]+)', l)
        for m in matches:
            digit = m.group(1) or m.group(2)
            digit = digit.replace('I', '1').replace('l', '1').replace('i', '1')
            text = m.group(3).strip()
            text = re.sub(r'[\(\[].*$', '', text).strip()
            if digit.isdigit() and text:
                d_int = int(digit)
                if 1 <= d_int <= 4 and d_int not in opts:
                    opts[d_int] = text
    return opts

missing_opts_q = []
good_q = 0

for c_meta in col_starts_meta:
    c_idx = c_meta['c_idx']
    lines = cols[c_idx][1]
    starts = {int(k): v for k, v in c_meta['starts'].items()}
    q_start = c_meta['q_start']
    q_end = c_meta['q_end']
    
    for qn in range(q_start, q_end + 1):
        if qn == 32:
            # Q32 options are in Col 3 lines 0-5
            col3_lines = cols[3][1]
            chunk = col3_lines[:6]
        else:
            st = starts.get(qn, 0)
            next_qn = qn + 1
            if next_qn in starts:
                en = starts[next_qn]
            else:
                en = len(lines)
            chunk = lines[st:en]
            
        opts = parse_opts(chunk)
        if len(opts) == 4:
            good_q += 1
        else:
            missing_opts_q.append((qn, len(opts), opts, chunk))

print(f"Total questions with exactly 4 options: {good_q} / 254")
print(f"Questions needing option inspection: {len(missing_opts_q)}")
for qn, cnt, opts, ch in missing_opts_q[:15]:
    print(f"Q{qn}: found {cnt} opts -> {opts} | chunk lines={len(ch)}")
