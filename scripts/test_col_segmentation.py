import json
import re

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Group by (file, col)
cols = []
cur_key = None
cur_list = []
for idx, item in enumerate(raw_lines):
    if idx >= 2599: break
    key = (item['file'], item['col'])
    if key != cur_key:
        if cur_list:
            cols.append((cur_key, cur_list))
        cur_key = key
        cur_list = []
    cur_list.append(item['text'])
if cur_list:
    cols.append((cur_key, cur_list))

col_ranges = [
    (1, 7),     # 00: p31_r c2
    (8, 19),    # 01: p32_l c0
    (20, 31),   # 02: p32_l c1
    (32, 42),   # 03: p32_l c2
    (43, 54),   # 04: p32_r c0
    (55, 66),   # 05: p32_r c1
    (67, 74),   # 06: p32_r c2
    (75, 80),   # 07: p33_l c0
    (81, 86),   # 08: p33_l c1
    (87, 91),   # 09: p33_l c2
    (92, 97),   # 10: p33_r c0
    (98, 101),  # 11: p33_r c1
    (102, 106), # 12: p33_r c2
    (107, 111), # 13: p34_l c0
    (112, 116), # 14: p34_l c1
    (117, 121), # 15: p34_l c2
    (122, 128), # 16: p34_r c0
    (129, 134), # 17: p34_r c1
    (135, 139), # 18: p34_r c2
    (140, 145), # 19: p35_l c0
    (146, 150), # 20: p35_l c1
    (151, 155), # 21: p35_l c2
    (156, 161), # 22: p35_r c0
    (162, 166), # 23: p35_r c1
    (167, 172), # 24: p35_r c2
    (173, 176), # 25: p36_l c0
    (177, 182), # 26: p36_l c1
    (183, 185), # 27: p36_l c2
    (186, 194), # 28: p36_r c0
    (195, 198), # 29: p36_r c1
    (199, 203), # 30: p36_r c2
    (204, 207), # 31: p37_l c0
    (208, 212), # 32: p37_l c1
    (213, 216), # 33: p37_l c2
    (217, 223), # 34: p37_r c0
    (224, 229), # 35: p37_r c1
    (230, 234), # 36: p37_r c2
    (235, 240), # 37: p38_l c0
    (241, 245), # 38: p38_l c1
    (246, 250), # 39: p38_l c2
    (251, 254), # 40: p38_r c0
]

all_parsed_questions = {}

for c_idx, ((fname, col_no), lines) in enumerate(cols):
    q_start, q_end = col_ranges[c_idx]
    num_expected = q_end - q_start + 1
    
    # Let's find question start lines in this column
    # A line starts question `q` if:
    # It starts with `q.` or `q,` or `q)` or if OCR replaced digits (e.g. 68 for 48)
    starts = []
    for line_idx, text in enumerate(lines):
        # Exclude options (1)-(4)
        if re.match(r'^[\(\[]\s*[1-4]\s*[\)\]]', text):
            continue
        # Exclude date lines
        if re.search(r'\d{2}\.\d{2}\.\d{4}', text):
            continue
            
        m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli]|SL)\s*[\.\,\)\-\:]\s*(.*)', text)
        if m:
            s = m.group(1).replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
            if s == 'SL': s = '51'
            if s.isdigit():
                val = int(s)
                if q_start <= val <= q_end:
                    starts.append((val, line_idx))
                    
    # Let's see which questions were found directly
    found_nums = [val for val, _ in starts]
    missing_in_col = [q for q in range(q_start, q_end + 1) if q not in found_nums]
    print(f"Col {c_idx:02d} (Q{q_start}-Q{q_end}): found {len(set(found_nums))}/{num_expected}. Missing: {missing_in_col}")
