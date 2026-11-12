import json
import re

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Group by (file, col)
cols = {}
for idx, item in enumerate(raw_lines):
    if idx >= 2599: break
    key = (item['file'], item['col'])
    if key not in cols: cols[key] = []
    cols[key].append(item['text'])

# Define exact (start_q, end_q) for each of the 41 columns:
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

print(f"Number of columns: {len(cols)}, Number of ranges: {len(col_ranges)}")
