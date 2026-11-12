import fitz
import json
import os
import io
from PIL import Image, ImageDraw

doc = fitz.open('analogy_chapter2.pdf')

# 1. Render p39 bottom-right (Type-IV 1..128 cols 1-3) + p40 left (col 4 of 1..128) + p40 top-mid (129..254)
pix1 = doc[38].get_pixmap(dpi=280, clip=fitz.Rect(680, 145, 836, 575))
pix2 = doc[39].get_pixmap(dpi=280, clip=fitz.Rect(15, 225, 115, 575))
pix3 = doc[39].get_pixmap(dpi=280, clip=fitz.Rect(110, 30, 275, 420))

im1 = Image.open(io.BytesIO(pix1.tobytes('png')))
im2 = Image.open(io.BytesIO(pix2.tobytes('png')))
im3 = Image.open(io.BytesIO(pix3.tobytes('png')))
h = max(im1.height, im2.height, im3.height)
canvas = Image.new('RGB', (im1.width + im2.width + im3.width + 20, h), (255, 255, 255))
canvas.paste(im1, (0, 0))
canvas.paste(im2, (im1.width + 10, 0))
canvas.paste(im3, (im1.width + im2.width + 20, 0))
canvas.save('scripts/pdf_samples/p39_p40_t4_ans_1_254.png')
print("Saved scripts/pdf_samples/p39_p40_t4_ans_1_254.png")

# 2. Build tight, high-DPI verify sheets using NOW-SYNCED t4_segmented_254.json!
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    seg_qs = json.load(f)
with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed_qs = json.load(f)

half_dir = 'scripts/pdf_samples/t4_half_150dpi'
def get_col_x_ranges():
    ranges = {'p31_r_c2': (30, 682, 836)}
    for pno in range(31, 37):
        pname = f"p{pno+1}"
        for side, is_r, x_lo, x_hi in [('l', False, 15, 450), ('r', True, 415, 836)]:
            with open(os.path.join(half_dir, f"{pname}_{side}.json"), 'r', encoding='utf-8') as f:
                raw = json.load(f)
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
            ranges[f"{pname}_{side}_c0"] = (pno, x_lo, s1 + 6)
            ranges[f"{pname}_{side}_c1"] = (pno, s1 - 6, s2 + 6)
            ranges[f"{pname}_{side}_c2"] = (pno, s2 - 6, x_hi)
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
    ranges['p38_l_c0'] = (37, 15, s1 + 6)
    ranges['p38_l_c1'] = (37, s1 - 6, s2 + 6)
    ranges['p38_l_c2'] = (37, s2 - 6, 450)
    ranges['p38_r_c0'] = (37, 418, 550)
    return ranges

col_xr = get_col_x_ranges()

def render_q_tight(qn):
    lns = seg_qs[qn - 1]['lines']
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
        y_min = min(ys) - 12
        y_max = max(ys) + 14
        # ONLY extend to column top if the question's FIRST column chunk is actually near top (< 90)
        if y_min < 90:
            y_min = 38
        # ONLY extend to column bottom if this chunk reaches near bottom (> 518)
        if y_max > 518:
            y_max = 562
        y_min = max(35, y_min)
        y_max = min(566, y_max)
        pix = doc[pno].get_pixmap(dpi=210, clip=fitz.Rect(x0, y_min, x1, y_max))
        parts_img.append(Image.open(io.BytesIO(pix.tobytes('png'))))
    if len(parts_img) == 1:
        return parts_img[0]
    w = sum(p.width + 6 for p in parts_img)
    h = max(p.height for p in parts_img)
    im = Image.new('RGB', (w, h), (240, 240, 240))
    dx = 0
    for p in parts_img:
        im.paste(p, (dx, 0))
        dx += p.width + 6
    return im

# Render tight sheets for ALL Q174..254 PLUS Q57..95 PLUS any flagged Q1..173!
# Let's check which Qs in 1..173 have issues or are non-explicit/empty/gap/suspicious
import re
flagged_1_173 = []
for qn in range(1, 174):
    seg = seg_qs[qn - 1]
    par = parsed_qs[qn - 1]
    lns = seg['lines']
    bad = False
    if not seg['explicit_q'] or qn in (65, 155):
        bad = True
    if any(not o for o in par['options']) or len(set(par['options'])) < 4:
        bad = True
    if '?' not in par['question_text'] and qn != 73:
        bad = True
    if any((lns[k+1]['y'] - lns[k]['y'] > 14.8) for k in range(len(lns)-1) if lns[k]['col'] == lns[k+1]['col']):
        bad = True
    if any(re.search(r'[A-Z].*[0-9]|[0-9].*[A-Z]|[a-z]', o) for o in par['options']):
        bad = True
    if any(l['col_name'].endswith('_l_c2') and l['col_name'].startswith(('p34', 'p35', 'p36')) for l in lns):
        bad = True
    if bad:
        flagged_1_173.append(qn)

target_qs = sorted(set(flagged_1_173) | set(range(57, 96)) | set(range(174, 255)))
print(f"Tight crop queue: {len(target_qs)} questions (flagged 1..173: {len(flagged_1_173)}, plus 57..95 & 174..254)")

out_dir = 'scripts/pdf_samples/t4_tight_sheets'
os.makedirs(out_dir, exist_ok=True)
PER_SHEET = 12
COLS = 3
for si, s_idx in enumerate(range(0, len(target_qs), PER_SHEET), 1):
    chunk = target_qs[s_idx:s_idx + PER_SHEET]
    crops = [(qn, render_q_tight(qn)) for qn in chunk]
    cell_w = max(im.width for _, im in crops) + 14
    rows = (len(crops) + COLS - 1) // COLS
    row_hs = [max(im.height for _, im in crops[r*COLS:(r+1)*COLS]) + 26 for r in range(rows)]
    canvas = Image.new('RGB', (cell_w * COLS, sum(row_hs) + 8), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    y_off = 4
    for r in range(rows):
        row_crops = crops[r*COLS:(r+1)*COLS]
        for c, (qn, im) in enumerate(row_crops):
            x_off = c * cell_w + 6
            draw.text((x_off, y_off), f"Q{qn} ({seg_qs[qn-1]['lines'][0]['col_name']})", fill=(200, 0, 0))
            canvas.paste(im, (x_off, y_off + 16))
        y_off += row_hs[r]
    out_p = os.path.join(out_dir, f"tight_{si:02d}.png")
    canvas.save(out_p)
print(f"Generated {si} tight sheets in {out_dir}")
