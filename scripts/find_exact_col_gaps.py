import json

def check_x_bounds(fname, is_right):
    with open(f'scripts/pdf_samples/t4_robust/{fname}', 'r', encoding='utf-8') as f:
        boxes = json.load(f)
    # 75 dpi -> scale = 72.0 / 75.0 = 0.96
    # if right half, add 420.95
    offset = 420.945 if is_right else 0.0
    scale = 72.0 / 75.0
    xs = []
    for b, t, s in boxes:
        if 'TELEGRAM' in t.upper() or '@APNA' in t.upper() or 'ANALOGY' in t.upper():
            continue
        x0 = b[0][0] * scale + offset
        x1 = b[1][0] * scale + offset
        xs.append((x0, x1, t))
    # Print buckets of 10 pt
    min_x = min(x[0] for x in xs)
    max_x = max(x[1] for x in xs)
    print(f"{fname}: x_min={min_x:.1f}, x_max={max_x:.1f}")
    # find gaps where no box spans
    gaps = []
    for pt in range(int(min_x), int(max_x)):
        if not any(x0 <= pt <= x1 for x0, x1, _ in xs):
            gaps.append(pt)
    # group consecutive gaps
    if gaps:
        spans = []
        s = gaps[0]
        p = gaps[0]
        for g in gaps[1:]:
            if g == p + 1:
                p = g
            else:
                if p - s >= 5:
                    spans.append((s, p))
                s = p = g
        if p - s >= 5:
            spans.append((s, p))
        print(f"  Column gaps (PDF pt): {spans}")

check_x_bounds('q_p32_left.json', False)
check_x_bounds('q_p32_right.json', True)
check_x_bounds('q_p35_left.json', False)
check_x_bounds('q_p35_right.json', True)
check_x_bounds('q_p38_left.json', False)
check_x_bounds('q_p38_right.json', True)
