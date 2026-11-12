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

def is_exam_line(text):
    t_up = text.upper()
    return any(k in t_up for k in ['EXAM', 'EXCM', 'EAM', 'EON', 'EXAN', 'SHIFT', 'SHIT', 'SHUT', 'SHAT', 'SHAF', 'SHT', 'SHN', 'TIER', 'TER', 'CBE', 'CDE', 'C&D', 'TF NO', 'ST SURUNE', 'CAPFS', 'CHSL', 'CGL', 'MTS', 'GD)'])

def get_chunk_opts(chunk):
    opts = {}
    digit_map = {'1': 1, 'I': 1, 'L': 1, '2': 2, '3': 3, '4': 4, 'H': 4}
    unassigned = []
    for l in chunk[1:]:
        if is_exam_line(l) or re.search(r'\d{2}\.\d{2}\.\d{4}', l):
            continue
        matches = list(re.finditer(r'(?:[\(\[]\s*([1-4IliHh])\s*[\)\]\.]*|(?:^|\s)([1-4])\s*[\)\]\.\s]+)\s*([A-Za-z0-9\:\;\,\#\%\-\_\?\~\s]+)', l))
        if matches:
            for m in matches:
                raw_d = (m.group(1) or m.group(2) or '').upper()
                d_int = digit_map.get(raw_d)
                text = m.group(3).strip()
                text = re.sub(r'[\(\[].*$', '', text).strip()
                if d_int and text and d_int not in opts:
                    opts[d_int] = text
        else:
            cl = re.sub(r'^[\(\)\[\]\.\,\s]+', '', l).strip()
            if cl and len(cl) >= 2:
                unassigned.append(cl)
    missing_digits = [d for d in [1, 2, 3, 4] if d not in opts]
    for d, u_text in zip(missing_digits, unassigned):
        opts[d] = u_text
    return opts

incomplete_list = []
for c_meta in col_starts_meta:
    c_idx = c_meta['c_idx']
    lines = cols[c_idx][1]
    starts = {int(k): v for k, v in c_meta['starts'].items()}
    q_start = c_meta['q_start']
    q_end = c_meta['q_end']
    
    for qn in range(q_start, q_end + 1):
        if qn in [32, 69, 167]: continue
        st = starts.get(qn, 0)
        en = starts.get(qn + 1, len(lines))
        chunk = lines[st:en]
        opts = get_chunk_opts(chunk)
        if len(opts) < 4 or any(not opts.get(i) for i in [1, 2, 3, 4]):
            incomplete_list.append({
                'q_num': qn,
                'opts': opts,
                'chunk': chunk
            })

print(f"Total incomplete: {len(incomplete_list)}")
with open('scripts/pdf_samples/t4_incomplete_options.json', 'w', encoding='utf-8') as f:
    json.dump(incomplete_list, f, indent=2)
print("Saved t4_incomplete_options.json")
