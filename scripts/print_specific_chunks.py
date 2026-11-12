import json

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

for qn in [1, 5, 8, 12, 13, 14, 16, 17, 18, 19, 20]:
    for c_meta in col_starts_meta:
        q_start = c_meta['q_start']
        q_end = c_meta['q_end']
        if q_start <= qn <= q_end:
            c_idx = c_meta['c_idx']
            lines = cols[c_idx][1]
            starts = {int(k): v for k, v in c_meta['starts'].items()}
            st = starts.get(qn, 0)
            en = starts.get(qn + 1, len(lines))
            chunk = lines[st:en]
            print(f"=== Q{qn} (Col {c_idx}) ===")
            for l in chunk:
                print(f"  {l}")
