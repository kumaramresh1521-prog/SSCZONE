import fitz
import json
import re
from PIL import Image, ImageDraw
import io

doc = fitz.open('analogy_chapter2.pdf')

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    seg_qs = json.load(f)
with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed = json.load(f)

# Use col_xr helper cleanly
import sys, os
sys.path.insert(0, 'scripts')

half_dir = 'scripts/pdf_samples/t4_half_150dpi'
def get_col_x_ranges():
    ranges = {'p31_r_c2': (30, 682, 836)}
    for pno in range(31, 37):
        pname = f"p{pno+1}"
        for side, is_r, x_lo, x_hi in [('l', False, 15, 452), ('r', True, 415, 836)]:
            with open(os.path.join(half_dir, f"{pname}_{side}.json"), 'r', encoding='utf-8') as f:
                raw = json.load(f)
            clean = [it for it in raw if 42 <= (it['box'][0][1]+it['box'][2][1])/2 <= 570]
            x_base = 420.0 if is_r else 20.0
            def best_x(lo, hi):
                best = None
                for x in range(int(lo), int(hi) + 1):
                    cross = sum(1 for b in clean if b['box'][0][0] < x < b['box'][1][0])
                    md = min((min(abs(x - b['box'][0][0]), abs(x - b['box'][1][0])) for b in clean), default=99)
                    sc = cross * 1000 - md
                    if best is None or sc < best[0]:
                        best = (sc, x)
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
            md = min((min(abs(x - b['box'][0][0]), abs(x - b['box'][1][0])) for b in clean38), default=99)
            sc = cross * 1000 - md
            if best is None or sc < best[0]:
                best = (sc, x)
        return best[1]
    s1 = best_x38(130, 185)
    s2 = best_x38(260, 315)
    ranges['p38_l_c0'] = (37, 15, s1 + 6)
    ranges['p38_l_c1'] = (37, s1 - 6, s2 + 6)
    ranges['p38_l_c2'] = (37, s2 - 6, 452)
    ranges['p38_r_c0'] = (37, 418, 550)
    return ranges

col_xr = get_col_x_ranges()

def crop_q(qn):
    lns = seg_qs[qn - 1]['lines']
    c0 = lns[0]['col_name']
    pno, x0, x1 = col_xr[c0]
    ys = [l['y'] for l in lns if l['col_name'] == c0]
    y0 = max(35, min(ys) - 14)
    y1 = min(566, max(ys) + 16)
    pix = doc[pno].get_pixmap(dpi=240, clip=fitz.Rect(x0, y0, min(x1 + 8, 840 if x1 > 450 else 460), y1))
    return (f"Q{qn}", Image.open(io.BytesIO(pix.tobytes('png'))))

tiles = [crop_q(q) for q in [106, 115, 166, 173, 184, 185, 186, 187, 217]]

# Also locate Q214 in exp_p67/exp_p68!
for fn in ['exp_p66_right.json', 'exp_p67_left.json', 'exp_p67_right.json', 'exp_p68_left.json']:
    with open(f'scripts/pdf_samples/t4_robust/{fn}', 'r', encoding='utf-8') as f:
        its = json.load(f)
    for b in its:
        if any(k in b[1] for k in ['214.', '213.', '215.', 'DGIE', 'KNPL']):
            print(f"Found {b[1]!r} in {fn} at box={b[0]}")

# Crop doc[66] (p67) right & doc[67] (p68) left middle/bottom where 214 is likely
pix_214a = doc[66].get_pixmap(dpi=220, clip=fitz.Rect(420, 40, 835, 570))
pix_214b = doc[67].get_pixmap(dpi=220, clip=fitz.Rect(15, 40, 435, 570))
tiles.append(("p67_right_exp", Image.open(io.BytesIO(pix_214a.tobytes('png')))))
tiles.append(("p68_left_exp", Image.open(io.BytesIO(pix_214b.tobytes('png')))))

# Save Q tiles separately from full page exp so Q tiles stay huge!
qtiles = tiles[:9]
cw = max(im.width for _, im in qtiles) + 12
rows = 3
rh = [max(im.height for _, im in qtiles[r*3:(r+1)*3]) + 26 for r in range(3)]
c1 = Image.new('RGB', (cw*3, sum(rh)+8), (255,255,255))
d1 = ImageDraw.Draw(c1)
yo = 4
for r in range(3):
    for ci, (lbl, im) in enumerate(qtiles[r*3:(r+1)*3]):
        xo = ci*cw + 6
        d1.text((xo, yo), lbl, fill=(200,0,0))
        c1.paste(im, (xo, yo+16))
    yo += rh[r]
c1.save('scripts/pdf_samples/t4_edge_checks.png')

# Save just Q214 exp zoom if found, otherwise side by side
c2 = Image.new('RGB', (tiles[9][1].width + tiles[10][1].width + 10, max(tiles[9][1].height, tiles[10][1].height)), (255,255,255))
c2.paste(tiles[9][1], (0, 0))
c2.paste(tiles[10][1], (tiles[9][1].width + 10, 0))
c2.save('scripts/pdf_samples/t4_exp_214_check.png')
print("Saved t4_edge_checks.png and t4_exp_214_check.png")
