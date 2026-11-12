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
    y_mid = (box[0][1] + box[2][1]) / 2.0
    if any(k in t_up for k in ['TELEGRAM', '@APNA', 'EGRAM', 'K5279', 'ANALOGYORSIMILARITY', 'ANALOGY OR SIMILARITY', 'TYPE-IV', 'TYPE -IV', 'TYPE - IV']):
        return True
    if y_mid < 42 and any(k in t_up for k in ['ANALOGY', 'SIMILARITY']):
        return True
    if y_mid < 40 and len(t_up) <= 4:
        return True
    if y_mid > 573:
        return True
    return False

def find_two_col_splits(boxes, is_right):
    x_base = 420.0 if is_right else 20.0
    def best_x(lo, hi):
        best = None
        for x in range(int(lo), int(hi)+1):
            cross = sum(1 for b in boxes if b['box'][0][0] < x < b['box'][1][0])
            min_dist = min((min(abs(x - b['box'][0][0]), abs(x - b['box'][1][0])) for b in boxes), default=99)
            score = cross * 1000 - min_dist
            if best is None or score < best[0]:
                best = (score, x, cross)
        return best[1]
    return best_x(x_base + 110, x_base + 165), best_x(x_base + 240, x_base + 295)

def cluster_col_lines(boxes):
    # Sort by y_mid
    with_y = []
    for b in boxes:
        ym = (b['box'][0][1] + b['box'][2][1]) / 2.0
        xm = (b['box'][0][0] + b['box'][1][0]) / 2.0
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
                'y': cur_y,
                'text': " ".join(x[2] for x in cur),
                'parts': [(round(x[1], 1), x[2]) for x in cur]
            })
            cur = [item]
            cur_y = ym
    if cur:
        cur.sort(key=lambda t: t[1])
        lines.append({
            'y': cur_y,
            'text': " ".join(x[2] for x in cur),
            'parts': [(round(x[1], 1), x[2]) for x in cur]
        })
    return lines

# Build 41 ordered columns
all_cols = []
for name in order:
    with open(os.path.join(half_dir, f"{name}.json"), 'r', encoding='utf-8') as f:
        raw = json.load(f)
    clean = [it for it in raw if not is_noise(it['box'], it['text'])]
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

print(f"Constructed {len(all_cols)} columns, total lines: {sum(len(c['lines']) for c in all_cols)}")

# Known question ranges per column from book structure
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
    return any(k in t_up for k in ['EXAM', 'EXCM', 'EXAN', 'SHIFT', 'SHIT', 'SHIF', 'SHNT', 'SHTT', 'TIER', 'TER-', 'CBE', 'CHSL', 'CGL', 'MTS', 'CAPFS', 'STENO', 'CONSTABLE', 'GD)', 'SITTING']) or bool(re.search(r'\d{2}\.\d{2}\.\d{4}', text))

def is_opt_line(text):
    return bool(re.match(r'^[\(\[]\s*[1-4Ili\|]\s*[\)\]]', text.strip()))

# Flatten stream with col index
stream = []
for ci, c in enumerate(all_cols):
    for li, ln in enumerate(c['lines']):
        stream.append({'col': ci, 'col_name': c['name'], 'line': ln['text'], 'parts': ln['parts'], 'y': ln['y']})

# Locate start index in stream for every question 1..254
# Wait: since we know col_ranges[ci] = (qs, qe), find each qn inside its column (or immediately after previous exam line)!
q_starts = {}
for ci, (qs, qe) in enumerate(col_ranges):
    col_indices = [i for i, it in enumerate(stream) if it['col'] == ci]
    starts_in_col = {}
    for qn in range(qs, qe + 1):
        # Match pattern starting with qn or known OCR digit quirks (B for 8, S for 5, I for 1, O for 0, etc.)
        # Actually search sequentially after previous qn start!
        min_idx = col_indices[0] if qn == qs else (starts_in_col.get(qn - 1, col_indices[0] - 1) + 1)
        found = None
        for idx in col_indices:
            if idx < min_idx:
                continue
            txt = stream[idx]['line'].strip()
            if is_opt_line(txt) or is_exam_line(txt):
                continue
            # Clean leading punct
            t_check = txt.lstrip('.*+•- ')
            # Replace common OCR confusion on initial number before dot/comma/letter
            m = re.match(r'^(\d{1,3}|B|I\d|\d[LIli]|SL|SO|[12][O0]\d)\s*[\.\,\:\s]?\s*(.*)', t_check)
            # Check strict numeric match first
            m_num = re.match(r'^[^\w]*(\d{1,3})\s*[\.\,\:\s]\s*(.*)', txt)
            if m_num and int(m_num.group(1)) == qn:
                found = idx
                break
            # Check glued number like "13RTU" or "12.VOT" or "I3RIU"
            m_glued = re.match(r'^[^\w]*([12]?\d{1,2})\s*([A-Z].*)', txt)
            if m_glued and int(m_glued.group(1)) == qn:
                found = idx
                break
            # Specific OCR glitches on first digit: B->8, I->1, L->1, S->5, O->0
            norm = txt.lstrip('.*+• ')
            if norm.startswith('B.') and qn == 8: found = idx; break
            if len(norm) >= 2:
                # Replace I/l at start with 1, B with 8, O with 0 in first 3 chars
                head = norm[:4].replace('I', '1').replace('l', '1').replace('O', '0').replace('S', '5').replace('B', '8')
                m_fix = re.match(r'^(\d{1,3})', head)
                if m_fix and int(m_fix.group(1)) == qn:
                    # make sure it's not an exam year/shift
                    if not re.match(r'^\(?[1-4]\)', txt):
                        found = idx
                        break
        if found is not None:
            starts_in_col[qn] = found
            q_starts[qn] = found

print(f"Explicitly found starts: {len(q_starts)} / 254")
missing_starts = [q for q in range(1, 255) if q not in q_starts]
print(f"Missing explicit starts ({len(missing_starts)}): {missing_starts}")

# Fallback for any missing start: line right after previous question's exam line
for qn in range(1, 255):
    if qn not in q_starts:
        # Check col of qn
        ci = next(i for i, (qs, qe) in enumerate(col_ranges) if qs <= qn <= qe)
        col_indices = [i for i, it in enumerate(stream) if it['col'] == ci]
        if qn == col_ranges[ci][0]:
            q_starts[qn] = col_indices[0]
        else:
            prev = q_starts[qn - 1]
            # advance past exam line after prev
            pos = prev + 1
            while pos < len(stream) and not is_exam_line(stream[pos]['line']):
                pos += 1
            while pos < len(stream) and is_exam_line(stream[pos]['line']):
                pos += 1
            if pos < len(stream):
                q_starts[qn] = pos

print("Missing after fallback:", [q for q in range(1, 255) if q not in q_starts])

# Dump stream + q_starts for verification
with open('scripts/pdf_samples/t4_150dpi_stream.json', 'w', encoding='utf-8') as f:
    json.dump({'stream': stream, 'q_starts': q_starts, 'missing_explicit': missing_starts}, f, ensure_ascii=False, indent=2)

# Print context around any missing_starts so we verify 100% of question boundaries!
for qn in missing_starts:
    st = q_starts[qn]
    print(f"\n--- Missing explicit start Q{qn} -> fallback idx={st} ({stream[st]['col_name']}) ---")
    for k in range(max(0, st - 2), min(len(stream), st + 4)):
        mark = ">>>" if k == st else "   "
        print(f"  {mark} [{k}] {stream[k]['line']}")
