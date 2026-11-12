import fitz
import json
import os
import io
from PIL import Image, ImageDraw

doc = fitz.open('analogy_chapter2.pdf')
os.makedirs('scripts/pdf_samples/t4_verify_sheets', exist_ok=True)

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    seg_qs = json.load(f)

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed_qs = json.load(f)

# Load solve_and_audit results by importing helper cleanly
import sys
sys.path.insert(0, 'scripts')
import solve_and_audit_t4 as sat

# Map half_page name -> page index & column x-ranges
half_dir = 'scripts/pdf_samples/t4_half_150dpi'
def get_col_x_ranges():
    ranges = {}
    # p31_r_c2
    ranges['p31_r_c2'] = (30, 685, 835)
    for pno in range(31, 37):
        pname = f"p{pno+1}"
        for side, is_r, x_lo, x_hi in [('l', False, 15, 445), ('r', True, 418, 835)]:
            with open(os.path.join(half_dir, f"{pname}_{side}.json"), 'r', encoding='utf-8') as f:
                raw = json.load(f)
            # clean top/bot headers roughly for split finding
            clean = [it for it in raw if 42 <= (it['box'][0][1]+it['box'][2][1])/2 <= 570]
            x_base = 420.0 if is_r else 20.0
            def best_x(lo, hi):
                best = None
                for x in range(int(lo), int(hi) + 1):
                    cross = sum(1 for b in clean if b['box'][0][0] < x < b['box'][1][0])
                    min_dist = min((min(abs(x - b['box'][0][0]), abs(x - b['box'][1][0])) for b in clean), default=99)
                    score = cross * 1000 - min_dist
                    if best is None or score < best[0]:
                        best = (score, x)
                return best[1]
            s1 = best_x(x_base + 110, x_base + 165)
            s2 = best_x(x_base + 240, x_base + 295)
            ranges[f"{pname}_{side}_c0"] = (pno, x_lo, s1 + 4)
            ranges[f"{pname}_{side}_c1"] = (pno, s1 - 4, s2 + 4)
            ranges[f"{pname}_{side}_c2"] = (pno, s2 - 4, x_hi)
    # p38_l
    with open(os.path.join(half_dir, "p38_l.json"), 'r', encoding='utf-8') as f:
        raw38 = json.load(f)
    clean38 = [it for it in raw38 if 42 <= (it['box'][0][1]+it['box'][2][1])/2 <= 570]
    def best_x38(lo, hi):
        best = None
        for x in range(int(lo), int(hi) + 1):
            cross = sum(1 for b in clean38 if b['box'][0][0] < x < b['box'][1][0])
            min_dist = min((min(abs(x - b['box'][0][0]), abs(x - b['box'][1][0])) for b in clean38), default=99)
            score = cross * 1000 - min_dist
            if best is None or score < best[0]:
                best = (score, x)
        return best[1]
    s1 = best_x38(130, 185)
    s2 = best_x38(260, 315)
    ranges['p38_l_c0'] = (37, 15, s1 + 4)
    ranges['p38_l_c1'] = (37, s1 - 4, s2 + 4)
    ranges['p38_l_c2'] = (37, s2 - 4, 448)
    ranges['p38_r_c0'] = (37, 420, 548)
    return ranges

col_xr = get_col_x_ranges()

# Identify ALL questions needing visual verification
non_explicit_set = {q['q_num'] for q in seg_qs if not q['explicit_q']}
to_verify = set()
reasons = {}

for q_seg, q_par in zip(seg_qs, parsed_qs):
    qn = q_seg['q_num']
    st, kind, data, rname = sat.test_question(q_par)
    r_list = []
    if st in ('UNSOLVED', 'EMPTY_OPT'):
        r_list.append(st)
    if qn in non_explicit_set:
        r_list.append('NON_EXP')
    lns = q_seg['lines']
    if any(l['col_name'].endswith('_l_c2') and l['col_name'].startswith(('p34', 'p35', 'p36', 'p37', 'p38')) for l in lns):
        r_list.append('SPINE_C2')
    if any((lns[k+1]['y'] - lns[k]['y'] > 14.2) for k in range(len(lns)-1) if lns[k]['col'] == lns[k+1]['col']):
        r_list.append('GAP')
    if any(not o for o in q_par['options']) or len(set(q_par['options'])) < 4:
        r_list.append('BAD_OPT')
    if qn in (65, 155, 217):
        r_list.append('NO_EXAM')
    if st == 'VERIFIED_NEEDS_CHARFIX' and any(any(c.islower() and c != 'g' for c in o) for o in q_par['options']):
        r_list.append('LOWER_NON_G')
    if r_list:
        to_verify.add(qn)
        reasons[qn] = ",".join(r_list)

verify_list = sorted(to_verify)
print(f"Total questions queued for visual PDF crop verification: {len(verify_list)}")
print(f"List: {verify_list}")

def render_q_crop(qn):
    q_seg = seg_qs[qn - 1]
    lns = q_seg['lines']
    # Group lines by col_name preserving order
    col_groups = []
    for l in lns:
        if not col_groups or col_groups[-1][0] != l['col_name']:
            col_groups.append((l['col_name'], [l]))
        else:
            col_groups[-1][1].append(l)

    parts_img = []
    for ci, (cname, clns) in enumerate(col_groups):
        pno, x0, x1 = col_xr[cname]
        ys = [l['y'] for l in clns]
        y_min = min(ys) - 14
        y_max = max(ys) + 18
        if y_min < 95:
            y_min = 38  # catch missed top-of-col lines under header rule
        if y_max > 525:
            y_max = 562  # catch missed bottom exam/option lines
        y_min = max(25, y_min)
        y_max = min(575, y_max)
        # If gap inside or non-explicit, give extra headroom
        if qn in non_explicit_set and ci == 0:
            # Check if previous col ended near bottom -> wait if prev col ended <535 or top was missed
            y_min = min(y_min, 40)
        rect = fitz.Rect(x0, y_min, x1, y_max)
        pix = doc[pno].get_pixmap(dpi=190, clip=rect)
        parts_img.append(Image.open(io.BytesIO(pix.tobytes("png"))))

    # Stitch multiple column parts horizontally if wrapped across col boundary
    if len(parts_img) == 1:
        im = parts_img[0]
    else:
        w = sum(p.width + 6 for p in parts_img)
        h = max(p.height for p in parts_img)
        im = Image.new('RGB', (w, h), (245, 245, 245))
        dx = 0
        for p in parts_img:
            im.paste(p, (dx, 0))
            dx += p.width + 6
    return im

# Build compact 3 columns x 6 rows (= 18 per sheet)
PER_SHEET = 18
COLS = 3
for s_idx in range(0, len(verify_list), PER_SHEET):
    chunk = verify_list[s_idx:s_idx + PER_SHEET]
    crops = []
    for qn in chunk:
        im = render_q_crop(qn)
        crops.append((qn, im))
    cell_w = max(im.width for _, im in crops) + 16
    rows = (len(crops) + COLS - 1) // COLS
    row_heights = []
    for r in range(rows):
        row_crops = crops[r*COLS:(r+1)*COLS]
        row_heights.append(max(im.height for _, im in row_crops) + 28)
    sheet_w = cell_w * COLS
    sheet_h = sum(row_heights) + 10
    canvas = Image.new('RGB', (sheet_w, sheet_h), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    y_off = 5
    for r in range(rows):
        row_crops = crops[r*COLS:(r+1)*COLS]
        for c_i, (qn, im) in enumerate(row_crops):
            x_off = c_i * cell_w + 6
            ans_ch = parsed_qs[qn-1]['correct_option']
            draw.rectangle([x_off - 2, y_off, x_off + cell_w - 10, y_off + row_heights[r] - 4], outline=(180, 180, 220), width=1)
            draw.text((x_off + 2, y_off + 2), f"Q{qn} [Key:{ans_ch}] ({reasons[qn]})", fill=(200, 0, 0))
            canvas.paste(im, (x_off, y_off + 18))
        y_off += row_heights[r]
    out_path = f"scripts/pdf_samples/t4_verify_sheets/sheet_{s_idx//PER_SHEET + 1:02d}.png"
    canvas.save(out_path)
    print(f"Saved {out_path} (Q{chunk[0]}..Q{chunk[-1]})")

# Also check Q161 & Q162 answer table & explanations!
# Scan expl JSONs for '161.' and '162.'
found_exp = []
for fn in sorted(os.listdir('scripts/pdf_samples/t4_robust')):
    if fn.startswith('exp_') and fn.endswith('.json'):
        with open(os.path.join('scripts/pdf_samples/t4_robust', fn), 'r', encoding='utf-8') as f:
            its = json.load(f)
        for it in its:
            t = it[1]
            if '161.' in t or '162.' in t or 'PRACTISE' in t.upper() or 'TECHNOLOGY' in t.upper() or 'KINGDOM' in t.upper():
                found_exp.append((fn, it[0], t))
print("\nMatches for Q161-162 in explanations:", found_exp)

# Render Q161-162 answer key area from p39/p40 & Q161-162 explanation page if found
# Type-IV answer table is on p39 right or p40 left -> let's check t4_answer_crop.png vs doc[38]/doc[39]
# Find page numbers of exp_* files (e.g. exp_p65_left -> doc[64])
check_parts = [render_q_crop(161), render_q_crop(162)]
for fn, box, t in found_exp[:4]:
    p_num = int(fn.split('_')[1][1:]) - 1
    is_r = 'right' in fn
    x0 = 420 if is_r else 15
    x1 = 835 if is_r else 425
    pix = doc[p_num].get_pixmap(dpi=200, clip=fitz.Rect(x0, max(30, box[0][1]-15), x1, min(580, box[2][1]+90)))
    check_parts.append(Image.open(io.BytesIO(pix.tobytes("png"))))
if check_parts:
    mw = max(p.width for p in check_parts)
    sh = sum(p.height + 10 for p in check_parts)
    c161 = Image.new('RGB', (mw + 10, sh + 10), (255, 255, 255))
    yy = 5
    for p in check_parts:
        c161.paste(p, (5, yy))
        yy += p.height + 10
    c161.save('scripts/pdf_samples/t4_check_161_162.png')
    print("Saved scripts/pdf_samples/t4_check_161_162.png")
