import json
import re
import os

def get_col_boxes(boxes, page_type):
    # page_type: 'left' or 'right'
    if page_type == 'left':
        col0 = [b for b in boxes if b[0][0][0] < 160]
        col1 = [b for b in boxes if 160 <= b[0][0][0] < 285]
        col2 = [b for b in boxes if b[0][0][0] >= 285]
    else: # right
        col0 = [b for b in boxes if b[0][0][0] < 140]
        col1 = [b for b in boxes if 140 <= b[0][0][0] < 265]
        col2 = [b for b in boxes if b[0][0][0] >= 265]
    
    col0.sort(key=lambda b: b[0][0][1])
    col1.sort(key=lambda b: b[0][0][1])
    col2.sort(key=lambda b: b[0][0][1])
    return [col0, col1, col2]

# Let's inspect the progression of columns across all 15 files
file_sequence = [
    ('q_p31_right.json', 'right', [2]), # only col 2 has Type-IV
]
for pno in range(32, 39):
    file_sequence.append((f'q_p{pno}_left.json', 'left', [0, 1, 2]))
    file_sequence.append((f'q_p{pno}_right.json', 'right', [0, 1, 2]))

all_columns = []
for fname, ptype, cols in file_sequence:
    path = f'scripts/pdf_samples/t4_robust/{fname}'
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        it = json.load(f)
        
    c0, c1, c2 = get_col_boxes(it, ptype)
    cand_cols = [c0, c1, c2]
    for c_idx in cols:
        col_boxes = cand_cols[c_idx]
        # Filter headers / footers
        filt = []
        for b, t, s in col_boxes:
            tc = t.strip()
            if not tc: continue
            if any(k in tc.upper() for k in ['TELEGRAM', '@APNA', 'ANALOGY', 'K5279']):
                continue
            # Stop before TYPE-V on p38 right
            if fname == 'q_p38_right.json' and 'TYPE-V' in tc.upper():
                break
            filt.append((b, tc))
        all_columns.append((f"{fname}_col{c_idx}", filt))

print(f"Total columns processed: {len(all_columns)}")

# Let's print the first question marker found in each column
for cname, cboxes in all_columns:
    q_found = []
    for b, t in cboxes:
        m = re.match(r'^[^\w]*(\d{1,3})\s*[\.\,\)\-]', t)
        if m:
            q_found.append(int(m.group(1)))
    print(f"{cname}: {len(cboxes)} boxes | Qs: {q_found[:5]} ... {q_found[-3:] if len(q_found) > 3 else []}")
