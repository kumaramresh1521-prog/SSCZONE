import json
import re
import os

def collect_column_lines():
    file_sequence = [
        ('q_p31_right.json', 'right', [2]), # only col 2 has Type-IV
    ]
    for pno in range(32, 39):
        file_sequence.append((f'q_p{pno}_left.json', 'left', [0, 1, 2]))
        file_sequence.append((f'q_p{pno}_right.json', 'right', [0, 1, 2]))

    def get_col_boxes(boxes, page_type):
        if page_type == 'left':
            col0 = [b for b in boxes if b[0][0][0] < 165]
            col1 = [b for b in boxes if 165 <= b[0][0][0] < 280]
            col2 = [b for b in boxes if b[0][0][0] >= 280]
        else: # right
            col0 = [b for b in boxes if b[0][0][0] < 125]
            col1 = [b for b in boxes if 125 <= b[0][0][0] < 255]
            col2 = [b for b in boxes if b[0][0][0] >= 255]
        
        col0.sort(key=lambda b: b[0][0][1])
        col1.sort(key=lambda b: b[0][0][1])
        col2.sort(key=lambda b: b[0][0][1])
        return [col0, col1, col2]

    all_lines = []
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
            for b, t, s in col_boxes:
                tc = t.strip()
                if not tc: continue
                if any(k in tc.upper() for k in ['TELEGRAM', '@APNA', 'ANALOGY', 'K5279']):
                    continue
                # On p31 col2, only keep y >= 170
                if fname == 'q_p31_right.json' and b[0][1] < 170:
                    continue
                # On p38 right, stop before TYPE-V
                if fname == 'q_p38_right.json' and 'TYPE-V' in tc.upper():
                    break
                all_lines.append({
                    'file': fname,
                    'col': c_idx,
                    'box': b,
                    'text': tc
                })
    return all_lines

lines = collect_column_lines()
print(f"Total structured lines: {len(lines)}")
with open('scripts/pdf_samples/t4_structured_lines.json', 'w', encoding='utf-8') as f:
    json.dump(lines, f, ensure_ascii=False, indent=2)
print("Saved t4_structured_lines.json")
