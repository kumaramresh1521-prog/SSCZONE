import json, os, re, fitz, io
from PIL import Image, ImageDraw

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

doc = fitz.open('analogy_chapter2.pdf')
items = []

# 1. Question gutter/right-edge zooms: 184, 185, 186, 187, 217, 249
for qn in [184, 185, 186, 187, 217, 249]:
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
    if side == 'l':
        cw = (half_l_end - 25) / 3.0
        x0 = max(5, 20 + ci * cw - 10)
        x1 = min(w, 20 + (ci + 1) * cw + 60)
    else:
        cw = (w - half_l_end - 20) / 3.0
        x0 = max(0, half_l_end + ci * cw - 10)
        x1 = min(w, half_l_end + (ci + 1) * cw + 60)
    y0 = max(25, min(ys) - 12)
    y1 = min(page.rect.height - 15, max(ys) + 32)
    pix = page.get_pixmap(dpi=250, clip=fitz.Rect(x0, y0, x1, y1))
    items.append((f"Q{qn} full", Image.open(io.BytesIO(pix.tobytes('png')))))

# 2. Render full column around 132, 149, 172, 249 in explanations using PyMuPDF page images or exp json scale check
# Wait: let's check pngs in scripts/pdf_samples/expl_pages or t4_robust!
t4r = sorted(os.listdir('scripts/pdf_samples/t4_robust'))
print("t4_robust files:", [fn for fn in t4r if fn.startswith('exp_')][:15])

# Check one image in t4_robust or expl_pages to know exact DPI
sample_img = next((fn for fn in t4r if fn.endswith('.png')), None)
if sample_img:
    im_s = Image.open(os.path.join('scripts/pdf_samples/t4_robust', sample_img))
    print(f"Sample image {sample_img} size={im_s.size}, doc page size=({doc[60].rect.width}, {doc[60].rect.height})")

for qt, fn_target in [(132, 'exp_p63_right.json'), (172, 'exp_p65_left.json'), (249, 'exp_p69_left.json')]:
    with open(os.path.join('scripts/pdf_samples/t4_robust', fn_target), 'r', encoding='utf-8') as f:
        boxes = json.load(f)
    m = re.match(r'exp_p(\d+)_(left|right)\.json', fn_target)
    p_idx, side = int(m.group(1)) - 1, m.group(2)
    page = doc[p_idx]
    w, h = page.rect.width, page.rect.height
    # Use matching PNG size if exists
    png_fn = fn_target.replace('.json', '.png')
    if os.path.exists(os.path.join('scripts/pdf_samples/t4_robust', png_fn)):
        pw, ph = Image.open(os.path.join('scripts/pdf_samples/t4_robust', png_fn)).size
        sx = pw / (w * 0.5)
        sy = ph / h
    else:
        sx = sy = 150 / 72.0
    for box, text, conf in boxes:
        if re.match(rf'^\s*{qt}\s*[\.\)]', text.strip()) or f' {qt}.' in text:
            bx0 = min(pt[0] for pt in box) / sx
            by0 = min(pt[1] for pt in box) / sy
            base_x = 0 if side == 'left' else w * 0.5
            # Note half page crop might have started at x=0 or x=15
            cx0 = max(0, base_x + bx0 - 20)
            cx1 = min(w, cx0 + 165)
            cy0 = max(20, by0 - 15)
            cy1 = min(h - 15, by0 + 165)
            pix = page.get_pixmap(dpi=250, clip=fitz.Rect(cx0, cy0, cx1, cy1))
            items.append((f"Exp Q{qt}", Image.open(io.BytesIO(pix.tobytes('png')))))
            break

# Also check Q149 exp across p64
for fn in ['exp_p64_left.json', 'exp_p64_right.json']:
    with open(os.path.join('scripts/pdf_samples/t4_robust', fn), 'r', encoding='utf-8') as f:
        boxes = json.load(f)
    for box, text, conf in boxes:
        if '149' in text or 'PLAN' in text.upper() or 'QOMK' in text.upper() or 'SQVT' in text.upper():
            m = re.match(r'exp_p(\d+)_(left|right)\.json', fn)
            p_idx, side = int(m.group(1)) - 1, m.group(2)
            page = doc[p_idx]; w, h = page.rect.width, page.rect.height
            png_fn = fn.replace('.json', '.png')
            if os.path.exists(os.path.join('scripts/pdf_samples/t4_robust', png_fn)):
                pw, ph = Image.open(os.path.join('scripts/pdf_samples/t4_robust', png_fn)).size
                sx, sy = pw / (w * 0.5), ph / h
            else:
                sx = sy = 150/72.0
            bx0 = min(pt[0] for pt in box) / sx
            by0 = min(pt[1] for pt in box) / sy
            base_x = 0 if side == 'left' else w * 0.5
            pix = page.get_pixmap(dpi=250, clip=fitz.Rect(max(0, base_x+bx0-25), max(20, by0-20), min(w, base_x+bx0+145), min(h-15, by0+140)))
            items.append((f"Exp Q149 ({text[:12]})", Image.open(io.BytesIO(pix.tobytes('png')))))

COLS = 3
cw = max(im.width for _, im in items) + 12
rows = (len(items) + COLS - 1) // COLS
rhs = []
for r in range(rows):
    rc = items[r*COLS:(r+1)*COLS]
    rhs.append(max(im.height for _, im in rc) + 26)
canvas = Image.new('RGB', (COLS * cw + 10, sum(rhs) + 10), (255, 255, 255))
draw = ImageDraw.Draw(canvas)
y_off = 5
for r in range(rows):
    rc = items[r*COLS:(r+1)*COLS]
    for ci, (lbl, im) in enumerate(rc):
        x_off = ci * cw + 5
        draw.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(180,180,220))
        draw.text((x_off+2, y_off+2), lbl, fill=(200,0,0))
        canvas.paste(im, (x_off, y_off+20))
    y_off += rhs[r]
canvas.save('scripts/pdf_samples/t4_final_zoom_checks.png')
print("Saved scripts/pdf_samples/t4_final_zoom_checks.png, total items:", len(items))
