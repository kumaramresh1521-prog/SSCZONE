import json
import os
import re

half_dir = 'scripts/pdf_samples/t4_half_150dpi'
order = [
    'p31_r',
    'p32_l', 'p32_r',
    'p33_l', 'p33_r',
    'p34_l', 'p34_r',
    'p35_l', 'p35_r',
    'p36_l', 'p36_r',
    'p37_l', 'p37_r',
    'p38_l', 'p38_r'
]

def is_noise(box, text):
    t_up = text.upper().strip()
    if any(k in t_up for k in ['TELEGRAM', '@APNA', 'ANALOGY OR SIMILARITY', 'ANALOGYORSIMILARITY', 'ANALOGY', 'K5279', 'TYPE-IV', 'TYPE -IV', 'TYPE - IV', 'DIRECTIONS']):
        # Wait: keep Directions if it's part of a question block like Q140..150? Actually Type-IV Q140+ says "Select the option..." Let's inspect DIRECTIONS first!
        if 'DIRECTIONS' in t_up:
            return False
        return True
    # Top/bottom border page numbers
    y_mid = (box[0][1] + box[2][1]) / 2.0
    if y_mid < 40 and len(t_up) < 5:
        return True
    if y_mid > 574:
        return True
    return False

def find_two_col_splits(boxes, is_right):
    # Base x-range of the half-page
    x_base = 420.0 if is_right else 20.0
    # Search split1 in [x_base + 115, x_base + 165], split2 in [x_base + 245, x_base + 295]
    # Pick x with minimal number of boxes crossing it (or minimal overlap)
    def best_x(lo, hi):
        best_val = (999999, (lo+hi)/2)
        for x in range(int(lo), int(hi)+1):
            cross = sum(1 for b in boxes if b['box'][0][0] < x < b['box'][1][0])
            # Distance from edge of nearest box
            min_dist = min((min(abs(x - b['box'][0][0]), abs(x - b['box'][1][0])) for b in boxes), default=99)
            score = cross * 1000 - min_dist
            if score < best_val[0]:
                best_val = (score, x, cross)
        return best_val
    s1 = best_x(x_base + 110, x_base + 165)
    s2 = best_x(x_base + 240, x_base + 295)
    return s1, s2

for name in order:
    path = os.path.join(half_dir, f"{name}.json")
    with open(path, 'r', encoding='utf-8') as f:
        raw = json.load(f)
    clean = [it for it in raw if not is_noise(it['box'], it['text'])]
    if name in ['p31_r', 'p38_r']:
        print(f"{name}: single col, {len(clean)}/{len(raw)} clean boxes")
        continue
    is_right = name.endswith('_r')
    s1, s2 = find_two_col_splits(clean, is_right)
    print(f"{name}: {len(clean)}/{len(raw)} clean | split1={s1[1]} (cross={s1[2]}), split2={s2[1]} (cross={s2[2]})")
