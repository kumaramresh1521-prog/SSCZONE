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

col_ranges = [
    (1, 7), (8, 19), (20, 31), (32, 42), (43, 54), (55, 66), (67, 74),
    (75, 80), (81, 86), (87, 91), (92, 97), (98, 101), (102, 106),
    (107, 111), (112, 116), (117, 121), (122, 128), (129, 134), (135, 139),
    (140, 145), (146, 150), (151, 155), (156, 161), (162, 166), (167, 172),
    (173, 176), (177, 182), (183, 185), (186, 194), (195, 198), (199, 203),
    (204, 207), (208, 212), (213, 216), (217, 223), (224, 229), (230, 234),
    (235, 240), (241, 245), (246, 250), (251, 254)
]

def is_q_start(line):
    # Matches line starting with number (e.g. 1. , 43. , SL , 68,COHL , 8o.)
    # OR starting with Select / In the following / Which of the
    # OR word 'is related to'
    # Exclude options (1)-(4)
    if re.match(r'^[\(\[]\s*[1-4Ili]\s*[\)\]]', line) or re.match(r'^[1-4]\s*[\)\]]', line):
        return False
    # Exclude dates
    if re.search(r'\d{2}\.\d{2}\.\d{4}', line):
        return False
    # Number followed by dot or space
    if re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][a-zA-Z]|[1-2]\d[a-zA-Z]|SL)\s*[\.\,\)\-\:]', line):
        return True
    # Select / In the following / Which of the
    if re.match(r'(?i)^[^\w]*(?:Select|Seiect|Seleet|Stiect|Sct|Sclet|Which of|In the follow|Four letter)', line):
        return True
    return False

# Test for each column
accurate_col_starts = {}
for c_idx, ((fname, col_no), lines) in enumerate(cols):
    q_start, q_end = col_ranges[c_idx]
    num_expected = q_end - q_start + 1
    
    cand_starts = []
    for li, l in enumerate(lines):
        if is_q_start(l):
            cand_starts.append((li, l))
            
    print(f"Col {c_idx:02d} (Q{q_start}-Q{q_end}): expected {num_expected} | detected {len(cand_starts)} candidates")
