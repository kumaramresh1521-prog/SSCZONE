import json
import re

print("=== ASSEMBLING COMPLETE TYPE-IV VERIFIED DATASET (1 to 254) ===")

# 1. Load structured lines
with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Group lines by column
cols = []
cur_key = None
cur_list = []
for idx, item in enumerate(raw_lines):
    if idx >= 2599: break # Type-IV only
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

def is_exam_line(text):
    t_up = text.upper()
    return any(k in t_up for k in ['EXAM', 'EXCM', 'EAM', 'EON', 'EXAN', 'SHIFT', 'SHIT', 'SHUT', 'SHAT', 'SHAF', 'SHT', 'SHN', 'TIER', 'TER', 'CBE', 'CDE', 'C&D', 'TF NO', 'ST SURUNE', 'CAPFS', 'CHSL', 'CGL', 'MTS', 'GD)'])

def is_option_line(text):
    return bool(re.match(r'^[\(\[]\s*[1-4Ili]\s*[\)\]]', text))

# Find starts for all questions
q_starts_by_col = []
for c_idx, ((fname, col_no), lines) in enumerate(cols):
    q_start, q_end = col_ranges[c_idx]
    starts = {}
    for idx, line in enumerate(lines):
        if is_option_line(line): continue
        if re.search(r'\d{2}\.\d{2}\.\d{4}', line): continue
        
        m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli]|SL)\s*[\.\,\)\-\:]\s*(.*)', line)
        if m:
            s = m.group(1).replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
            if s == 'SL': s = '51'
            if s.isdigit():
                val = int(s)
                if q_start <= val <= q_end:
                    if val not in starts: starts[val] = idx
                    continue
        if '68,COHL' in line and q_start <= 48 <= q_end: starts[48] = idx
        elif '88. KSOE' in line and q_start <= 53 <= q_end: starts[53] = idx
        elif '68.AOE' in line and q_start <= 69 <= q_end: starts[69] = idx
        elif ('7O, NRGLED' in line or '70, NRGLED' in line) and q_start <= 70 <= q_end: starts[70] = idx
        elif '38, DGIL' in line and q_start <= 39 <= q_end: starts[39] = idx
        elif '4L.ACCIDENT' in line and q_start <= 41 <= q_end: starts[41] = idx
        elif '12, Seect theopon' in line and q_start <= 121 <= q_end: starts[121] = idx
        elif '140. Seleet the opuion' in line and q_start <= 149 <= q_end: starts[149] = idx
        elif '187, Select the optilon' in line and q_start <= 157 <= q_end: starts[157] = idx
        elif '182. Select the option' in line and q_start <= 162 <= q_end: starts[162] = idx
        elif '19. Select the option' in line and q_start <= 199 <= q_end: starts[199] = idx
        elif '218.nfoloutnquonse' in line and q_start <= 217 <= q_end: starts[217] = idx
        elif 'FLLC is related to HNNE' in line and q_start <= 251 <= q_end: starts[251] = idx

    if q_start not in starts and q_start != 32:
        starts[q_start] = 0
        
    for qn in range(q_start, q_end + 1):
        if qn not in starts and qn != 32:
            prev_qn = qn - 1
            if prev_qn in starts:
                prev_start = starts[prev_qn]
                for li in range(prev_start + 1, len(lines)):
                    if is_exam_line(lines[li]):
                        starts[qn] = li + 1
                        break
                        
    if q_start <= 32 <= q_end:
        starts[32] = 0
        
    q_starts_by_col.append((c_idx, fname, col_no, q_start, q_end, lines, starts))

print(f"Col segmentation complete across {len(q_starts_by_col)} columns.")

# Save chunks
with open('scripts/pdf_samples/t4_col_starts.json', 'w', encoding='utf-8') as f:
    # serializable
    dump_data = []
    for c_idx, fname, col_no, q_start, q_end, lines, starts in q_starts_by_col:
        dump_data.append({
            'c_idx': c_idx, 'fname': fname, 'col_no': col_no,
            'q_start': q_start, 'q_end': q_end, 'starts': starts
        })
    json.dump(dump_data, f, indent=2)
print("Saved t4_col_starts.json")
