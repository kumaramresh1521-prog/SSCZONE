import json
import re

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

def is_exam_line(text):
    t_up = text.upper()
    return any(k in t_up for k in ['EXAM', 'EXCM', 'EAM', 'EON', 'EXAN', 'SHIFT', 'SHIT', 'SHUT', 'SHAT', 'SHAF', 'SHT', 'SHN', 'TIER', 'TER', 'CBE', 'CDE', 'C&D', 'TF NO', 'ST SURUNE', 'CAPFS', 'CHSL', 'CGL', 'MTS', 'GD)'])

def clean_opt(text):
    # Strip any leading (1), (2), (3), (4), I), H), (), etc.
    text = re.sub(r'^[^\w]*[1-4IliHhAaBbCcDd]?[\)\]\.\,\s]+', '', text)
    # Strip trailing exam or noise
    text = re.sub(r'[\(\[].*$', '', text)
    return text.strip()

# Test on Q43, Q44, Q45, Q41, Q37, Q31
test_qs = [41, 43, 44, 45, 37, 31, 27, 24, 19, 17]

for c_meta in col_starts_meta:
    c_idx = c_meta['c_idx']
    lines = cols[c_idx][1]
    starts = {int(k): v for k, v in c_meta['starts'].items()}
    q_start = c_meta['q_start']
    q_end = c_meta['q_end']
    
    for qn in test_qs:
        if q_start <= qn <= q_end:
            st = starts.get(qn, 0)
            en = starts.get(qn + 1, len(lines))
            chunk = lines[st:en]
            # Collect option candidates
            candidates = []
            for l in chunk[1:]:
                if is_exam_line(l) or re.search(r'\d{2}\.\d{2}\.\d{4}', l):
                    continue
                co = clean_opt(l)
                if co and len(co) >= 2:
                    candidates.append(co)
            print(f"Q{qn}: found {len(candidates)} candidates -> {candidates}")
