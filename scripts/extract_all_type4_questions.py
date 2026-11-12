import json
import re
import os

def parse_all_type4_questions():
    # 1. Collect all lines column by column in exact sequence
    file_sequence = [
        ('q_p31_right.json', 'right', [2]), # only col 2 has Type-IV
    ]
    for pno in range(32, 39):
        file_sequence.append((f'q_p{pno}_left.json', 'left', [0, 1, 2]))
        file_sequence.append((f'q_p{pno}_right.json', 'right', [0, 1, 2]))

    def get_col_boxes(boxes, page_type):
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

    ordered_lines = []
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
                # If on p31 col2, only keep y >= 170
                if fname == 'q_p31_right.json' and b[0][1] < 170:
                    continue
                # If on p38 right, stop before TYPE-V
                if fname == 'q_p38_right.json' and 'TYPE-V' in tc.upper():
                    break
                ordered_lines.append(tc)

    print(f"Total ordered lines collected: {len(ordered_lines)}")
    return ordered_lines

if __name__ == '__main__':
    lines = parse_all_type4_questions()
    with open('scripts/pdf_samples/t4_ordered_lines.json', 'w', encoding='utf-8') as f:
        json.dump(lines, f, ensure_ascii=False, indent=2)
    print("Saved t4_ordered_lines.json")
