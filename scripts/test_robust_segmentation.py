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

def is_exam_line(text):
    t_up = text.upper()
    return any(k in t_up for k in ['EXAM', 'EXCM', 'EAM', 'EON', 'EXAN', 'SHIFT', 'SHIT', 'SHUT', 'SHAT', 'SHAF', 'SHT', 'SHN', 'TIER', 'TER', 'CBE', 'CDE', 'C&D', 'TF NO', 'ST SURUNE', 'CAPFS', 'CHSL', 'CGL', 'MTS', 'GD)'])

def is_option_line(text):
    return bool(re.match(r'^[\(\[]\s*[1-4Ili]\s*[\)\]]', text))

# Test segmenting
segmented_questions = {}

for c_idx, ((fname, col_no), lines) in enumerate(cols):
    q_start, q_end = col_ranges[c_idx]
    
    # Special handling for Q32 whose prompt is at bottom of Col 2 and options in Col 3:
    # We will handle Q32 specifically.
    
    # Find all question start points in this column
    starts = []
    for idx, line in enumerate(lines):
        if is_option_line(line): continue
        if re.search(r'\d{2}\.\d{2}\.\d{4}', line): continue
        
        # Match explicit q_num
        m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli]|SL)\s*[\.\,\)\-\:]\s*(.*)', line)
        if m:
            s = m.group(1).replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
            if s == 'SL': s = '51'
            if s.isdigit():
                val = int(s)
                if q_start <= val <= q_end:
                    starts.append((val, idx))
                    continue
                    
        # Check OCR substitutions
        if '68,COHL' in line and q_start <= 48 <= q_end: starts.append((48, idx))
        elif '88. KSOE' in line and q_start <= 53 <= q_end: starts.append((53, idx))
        elif '68.AOE' in line and q_start <= 69 <= q_end: starts.append((69, idx))
        elif ('7O, NRGLED' in line or '70, NRGLED' in line) and q_start <= 70 <= q_end: starts.append((70, idx))
        elif '38, DGIL' in line and q_start <= 39 <= q_end: starts.append((39, idx))
        elif '4L.ACCIDENT' in line and q_start <= 41 <= q_end: starts.append((41, idx))
        elif '12, Seect theopon' in line and q_start <= 121 <= q_end: starts.append((121, idx))
        elif '140. Seleet the opuion' in line and q_start <= 149 <= q_end: starts.append((149, idx))
        elif '187, Select the optilon' in line and q_start <= 157 <= q_end: starts.append((157, idx))
        elif '182. Select the option' in line and q_start <= 162 <= q_end: starts.append((162, idx))
        elif '19. Select the option' in line and q_start <= 199 <= q_end: starts.append((199, idx))
        elif '218.nfoloutnquonse' in line and q_start <= 217 <= q_end: starts.append((217, idx))
        elif 'FLLC is related to HNNE' in line and q_start <= 251 <= q_end: starts.append((251, idx))

    # Deduplicate starts by q_num
    unique_starts = {}
    for qn, lidx in starts:
        if qn not in unique_starts:
            unique_starts[qn] = lidx
            
    # For any question in [q_start, q_end] not found by explicit number,
    # find where it must be by looking between the preceding and succeeding found questions!
    found_keys = sorted(unique_starts.keys())
    for qn in range(q_start, q_end + 1):
        if qn not in unique_starts:
            # Look at previous found question's end
            # Find the exam line of qn-1
            prev_qn = qn - 1
            if prev_qn in unique_starts:
                prev_start = unique_starts[prev_qn]
                # Find exam line after prev_start
                for li in range(prev_start + 1, len(lines)):
                    if is_exam_line(lines[li]):
                        # The very next line is candidate start for qn!
                        unique_starts[qn] = li + 1
                        break
                        
    print(f"Col {c_idx:02d} (Q{q_start}-Q{q_end}): resolved {len(unique_starts)}/{q_end - q_start + 1}")
    for qn, lidx in sorted(unique_starts.items()):
        segmented_questions[qn] = (fname, col_no, lidx, lines[lidx] if lidx < len(lines) else "EOF")

missing_total = [i for i in range(1, 255) if i not in segmented_questions]
print(f"\nTOTAL RESOLVED QUESTIONS: {len(segmented_questions)} / 254")
print(f"STILL MISSING: {len(missing_total)} -> {missing_total}")
