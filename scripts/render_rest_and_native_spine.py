import json, re, sys, fitz, io
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, 'scripts')
import solve_t4_254_v3 as v3

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

manually_verified = {1, 65, 121, 154, 155, 184, 185, 186, 187, 217}
rest_qns = []
for item in raw:
    qn = item['q_num']
    fix = v3.manual.get(qn, {})
    ex = fix.get('exam_tag', item.get('exam_tag', ''))
    has_date = bool(re.search(r'\d{2}\.\d{2}\.\d{4}', ex))
    m_sh = re.search(r'(?:Shift|Shif|Slift|Shiff|Shft|Shit|Sht|Stif|Shir|Shin|Shi|Shtft|Shff|Siift)\s*[-:\.]?\s*([A-Za-z0-9]+)', ex, re.I)
    in_visual = True
    if qn in manually_verified:
        in_visual = False
    elif has_date and ('Sitting' in ex or 'TFNo' in ex or 'Kolkata' in ex):
        in_visual = False
    elif has_date and m_sh and m_sh.group(1) in {'I', 'II', 'III', 'IV'}:
        in_visual = False
    if not in_visual:
        rest_qns.append(qn)

print(f"Rendering remaining {len(rest_qns)} exam tags into t4_exam_rest_80.png")
doc = fitz.open('analogy_chapter2.pdf')

def render_strip(qn, dpi=185, right_pad=55, tight_y=True):
    lines = segs[qn]['lines']
    by_col = {}
    for ln in lines:
        by_col.setdefault(ln['col_name'], []).append(ln['y'])
    cname, ys = list(by_col.items())[-1]
    m = cname.split('_')
    p_idx = int(m[0][1:]) - 1
    page = doc[p_idx]
    w = page.rect.width
    half_l_end = w * 0.50
    side, ci = m[1], int(m[2][1:])
    cw = (half_l_end - 25)/3.0 if side == 'l' else (w - half_l_end - 20)/3.0
    base = 20 if side == 'l' else half_l_end
    x0 = max(2, base + ci * cw - 12)
    x1 = min(w - 1, base + (ci + 1) * cw + right_pad)
    y0 = max(10, max(ys) - (20 if tight_y else 28))
    y1 = min(page.rect.height - 5, max(ys) + 15)
    pix = page.get_pixmap(dpi=dpi, clip=fitz.Rect(x0, y0, x1, y1))
    return Image.open(io.BytesIO(pix.tobytes('png')))

strips = [(qn, render_strip(qn)) for qn in rest_qns]
COLS = 4
cw = max(im.width for _, im in strips) + 8
rows = (len(strips) + COLS - 1) // COLS
rhs = [max(im.height for _, im in strips[r*COLS:(r+1)*COLS]) + 20 for r in range(rows)]
canvas = Image.new('RGB', (COLS * cw + 8, sum(rhs) + 8), (255, 255, 255))
draw = ImageDraw.Draw(canvas)
y_off = 4
for r in range(rows):
    for ci, (qn, im) in enumerate(strips[r*COLS:(r+1)*COLS]):
        x_off = ci * cw + 4
        draw.rectangle([x_off-2, y_off, x_off+cw-6, y_off+rhs[r]-3], outline=(190,190,220))
        draw.text((x_off+2, y_off+1), f"Q{qn:03d}", fill=(200,0,0))
        canvas.paste(im, (x_off, y_off+14))
    y_off += rhs[r]
canvas.save('scripts/pdf_samples/t4_exam_rest_80.png')
print(f"Saved scripts/pdf_samples/t4_exam_rest_80.png ({len(strips)} strips, {canvas.size})")

# Tight 700 DPI zoom ONLY on the Shift ending right at the spine for warped spine Qs
SPINE_QNS = [151, 152, 153, 182, 183, 184, 213, 214, 215, 216, 245, 246, 247, 248, 249]
s_strips = []
for qn in SPINE_QNS:
    lines = segs[qn]['lines']
    by_col = {}
    for ln in lines:
        by_col.setdefault(ln['col_name'], []).append(ln['y'])
    cname, ys = list(by_col.items())[-1]
    m = cname.split('_')
    p_idx = int(m[0][1:]) - 1
    page = doc[p_idx]
    w = page.rect.width
    half_l_end = w * 0.50
    side, ci = m[1], int(m[2][1:])
    cw = (half_l_end - 25)/3.0 if side == 'l' else (w - half_l_end - 20)/3.0
    base = 20 if side == 'l' else half_l_end
    # Focus specifically on the RIGHT 65% of the column + 35pt past gutter edge
    x0 = max(0, base + ci * cw + cw * 0.35)
    x1 = min(w, base + (ci + 1) * cw + 35)
    y0 = max(10, max(ys) - 20)
    y1 = min(page.rect.height - 5, max(ys) + 12)
    pix = page.get_pixmap(dpi=650, clip=fitz.Rect(x0, y0, x1, y1))
    im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('L')
    im = im.point(lambda p: int(255 * ((p / 255.0) ** 0.38)))
    im = ImageOps.autocontrast(im, cutoff=1).convert('RGB')
    s_strips.append((qn, im))

COLS = 3
cw = max(im.width for _, im in s_strips) + 12
rows = (len(s_strips) + COLS - 1) // COLS
rhs = [max(im.height for _, im in s_strips[r*COLS:(r+1)*COLS]) + 28 for r in range(rows)]
c2 = Image.new('RGB', (COLS * cw + 12, sum(rhs) + 12), (255, 255, 255))
d2 = ImageDraw.Draw(c2)
y_off = 6
for r in range(rows):
    for ci, (qn, im) in enumerate(s_strips[r*COLS:(r+1)*COLS]):
        x_off = ci * cw + 6
        d2.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(160,160,210))
        d2.text((x_off+4, y_off+3), f"Q{qn} SPINE-650", fill=(200,0,0))
        c2.paste(im, (x_off, y_off+20))
    y_off += rhs[r]
c2.save('scripts/pdf_samples/t4_spine_shifts_zoom.png')
print(f"Saved scripts/pdf_samples/t4_spine_shifts_zoom.png ({c2.size})")
