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

def is_noise(name, box, text):
    t_up = text.upper().strip()
    x0, y0 = box[0]
    x1, y1 = box[1][0], box[2][1]
    xm = (x0 + x1) / 2.0
    ym = (y0 + y1) / 2.0
    # Neighbor-column slivers
    if name == 'p31_r' and x0 < 688.0:
        return True
    if name == 'p38_r' and xm >= 544.5:
        return True
    if any(k in t_up for k in [
        'TELEGRAM', '@APNA', 'EGRAM', 'K5279',
        'ANALOGYORSIMILARITY', 'ANALOGY OR SIMILARITY',
        'TYPE-IV', 'TYPE -IV', 'TYPE - IV', 'TYPE-V', 'TYPE - V'
    ]):
        return True
    if ym < 42 and any(k in t_up for k in ['ANALOGY', 'SIMILARITY', 'TYPE']):
        return True
    if ym < 40 and len(t_up) <= 4:
        return True
    if ym > 573:
        return True
    return False

def find_two_col_splits(boxes, is_right):
    x_base = 420.0 if is_right else 20.0
    def best_x(lo, hi):
        best = None
        for x in range(int(lo), int(hi) + 1):
            cross = sum(1 for b in boxes if b['box'][0][0] < x < b['box'][1][0])
            min_dist = min((min(abs(x - b['box'][0][0]), abs(x - b['box'][1][0])) for b in boxes), default=99)
            score = cross * 1000 - min_dist
            if best is None or score < best[0]:
                best = (score, x, cross)
        return best[1]
    return best_x(x_base + 110, x_base + 165), best_x(x_base + 240, x_base + 295)

def cluster_col_lines(boxes):
    with_y = []
    for b in boxes:
        ym = (b['box'][0][1] + b['box'][2][1]) / 2.0
        with_y.append((ym, b['box'][0][0], b['text'].strip(), b['box']))
    with_y.sort(key=lambda t: t[0])
    lines = []
    cur = []
    cur_y = None
    for item in with_y:
        ym = item[0]
        if cur_y is None or abs(ym - cur_y) <= 4.8:
            cur.append(item)
            cur_y = sum(x[0] for x in cur) / len(cur)
        else:
            cur.sort(key=lambda t: t[1])
            lines.append({
                'y': round(cur_y, 2),
                'text': " ".join(x[2] for x in cur),
                'parts': [(round(x[1], 1), round(x[3][1][0], 1), x[2]) for x in cur]
            })
            cur = [item]
            cur_y = ym
    if cur:
        cur.sort(key=lambda t: t[1])
        lines.append({
            'y': round(cur_y, 2),
            'text': " ".join(x[2] for x in cur),
            'parts': [(round(x[1], 1), round(x[3][1][0], 1), x[2]) for x in cur]
        })
    return lines

# Check borderline boxes first for p31_r and p38_r
with open(os.path.join(half_dir, 'p31_r.json'), 'r', encoding='utf-8') as f:
    raw31 = json.load(f)
print("=== p31_r borderline x0 in 670..715 ===")
for it in sorted(raw31, key=lambda b: b['box'][0][0]):
    if 670 <= it['box'][0][0] <= 715:
        print(f"  x={it['box'][0][0]:.1f}..{it['box'][1][0]:.1f}, y={it['box'][0][1]:.1f} -> {it['text']!r}")

with open(os.path.join(half_dir, 'p38_r.json'), 'r', encoding='utf-8') as f:
    raw38 = json.load(f)
print("=== p38_r borderline x1 in 525..575 ===")
for it in sorted(raw38, key=lambda b: b['box'][1][0]):
    if 525 <= it['box'][1][0] <= 575:
        print(f"  x={it['box'][0][0]:.1f}..{it['box'][1][0]:.1f}, y={it['box'][0][1]:.1f} -> {it['text']!r}")

all_cols = []
for name in order:
    with open(os.path.join(half_dir, f"{name}.json"), 'r', encoding='utf-8') as f:
        raw = json.load(f)
    clean = [it for it in raw if not is_noise(name, it['box'], it['text'])]
    if name in ['p31_r', 'p38_r']:
        lines = cluster_col_lines(clean)
        all_cols.append({'name': f"{name}_c{'2' if name=='p31_r' else '0'}", 'lines': lines})
    else:
        is_right = name.endswith('_r')
        s1, s2 = find_two_col_splits(clean, is_right)
        c_boxes = [[], [], []]
        for it in clean:
            xm = (it['box'][0][0] + it['box'][1][0]) / 2.0
            c_idx = 0 if xm < s1 else (1 if xm < s2 else 2)
            c_boxes[c_idx].append(it)
        for ci in range(3):
            all_cols.append({'name': f"{name}_c{ci}", 'lines': cluster_col_lines(c_boxes[ci])})

stream = []
for ci, c in enumerate(all_cols):
    for li, ln in enumerate(c['lines']):
        stream.append({'idx': len(stream), 'col': ci, 'col_name': c['name'], 'line': ln['text'], 'parts': ln['parts'], 'y': ln['y']})

with open('scripts/pdf_samples/t4_clean_stream.json', 'w', encoding='utf-8') as f:
    json.dump({'cols': all_cols, 'stream': stream}, f, indent=2, ensure_ascii=False)

print(f"\nClean stream saved: {len(all_cols)} cols, {len(stream)} lines.")
print("\n=== Col 0 (p31_r_c2) full ===")
for it in [s for s in stream if s['col'] == 0]:
    print(f"  [{it['idx']:4d}] y={it['y']:5.1f} | {it['line']}")

print("\n=== Col 6 (p32_r_c2) bottom half ===")
for it in [s for s in stream if s['col'] == 6][-25:]:
    print(f"  [{it['idx']:4d}] y={it['y']:5.1f} | {it['line']}")

print("\n=== Col 39 & Col 40 (p38_l_c2 & p38_r_c0) ===")
for it in [s for s in stream if s['col'] in (39, 40)]:
    print(f"  [{it['idx']:4d}] ({it['col_name']}) y={it['y']:5.1f} | {it['line']}")
