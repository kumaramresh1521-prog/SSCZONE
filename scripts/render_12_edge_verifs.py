import json, os, re, fitz, io
from PIL import Image, ImageDraw

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

doc = fitz.open('analogy_chapter2.pdf')

qns = [78, 111, 132, 143, 167, 172, 184, 185, 186, 187, 200, 217, 249]
ims = []
for qn in qns:
    lines = segs[qn]['lines']
    by_col = {}
    for ln in lines:
        by_col.setdefault(ln['col_name'], []).append(ln['y'])
    # Render each col part with wide right margin
    parts = []
    for cname, ys in by_col.items():
        m = cname.split('_')
        p_idx = int(m[0][1:]) - 1
        page = doc[p_idx]
        w = page.rect.width
        half_l_end = w * 0.50
        side, ci = m[1], int(m[2][1:])
        if side == 'l':
            cw = (half_l_end - 25) / 3.0
            x0 = max(5, 20 + ci * cw - 12)
            x1 = min(w, 20 + (ci + 1) * cw + 38)
        else:
            cw = (w - half_l_end - 20) / 3.0
            x0 = max(0, half_l_end + ci * cw - 12)
            x1 = min(w, half_l_end + (ci + 1) * cw + 38)
        y0 = max(25, min(ys) - 18)
        y1 = min(page.rect.height - 15, max(ys) + 34)
        pix = page.get_pixmap(dpi=230, clip=fitz.Rect(x0, y0, x1, y1))
        parts.append(Image.open(io.BytesIO(pix.tobytes('png'))))
    if len(parts) == 1:
        im = parts[0]
    else:
        mw = max(p.width for p in parts)
        sh = sum(p.height + 4 for p in parts)
        im = Image.new('RGB', (mw, sh), (255, 255, 255))
        yy = 0
        for p in parts:
            im.paste(p, (0, yy)); yy += p.height + 4
    ims.append((qn, im))

# Also scan exp_*.json in scripts/pdf_samples/t4_robust for explanations of 111, 132, 143, 149, 167, 172, 200, 249
exp_targets = {111, 132, 143, 149, 167, 172, 200, 249}
exp_hits = {}
for fn in sorted(os.listdir('scripts/pdf_samples/t4_robust')):
    if not (fn.startswith('exp_') and fn.endswith('.json')):
        continue
    # e.g. exp_p61_left.json
    with open(os.path.join('scripts/pdf_samples/t4_robust', fn), 'r', encoding='utf-8') as f:
        boxes = json.load(f)
    for idx, (box, text, conf) in enumerate(boxes):
        for qt in list(exp_targets):
            if re.match(rf'^\s*{qt}\s*[\.\)]', text.strip()) or f' {qt}.' in text:
                if qt not in exp_hits:
                    exp_hits[qt] = (fn, box, text)

print("Found explanation anchors:", {k: (v[0], v[2]) for k, v in exp_hits.items()})

exp_ims = []
for qt in sorted(exp_hits):
    fn, box, text = exp_hits[qt]
    m = re.match(r'exp_p(\d+)_(left|right)\.json', fn)
    p_idx = int(m.group(1)) - 1
    side = m.group(2)
    page = doc[p_idx]
    w = page.rect.width
    x0 = 15 if side == 'left' else w * 0.5 - 5
    x1 = w * 0.5 + 15 if side == 'left' else w - 10
    # Crop whole strip around x of box within its column (about 160pt wide around box)
    # Wait: coordinates in exp_pXX JSONs are at 150dpi or PDF pts? Let's check box coords!
    print(f"  Exp Q{qt} box={box[:2]}")
    # In OCR files (150 dpi or 200 dpi halfpage): scale factor! Wait let's check image width of halfpage if present
    bx0 = min(pt[0] for pt in box)
    by0 = min(pt[1] for pt in box)
    # Check max x in file to infer scale
    with open(os.path.join('scripts/pdf_samples/t4_robust', fn), 'r', encoding='utf-8') as f:
        allb = json.load(f)
    maxx = max(max(pt[0] for pt in b[0]) for b in allb)
    maxy = max(max(pt[1] for pt in b[0]) for b in allb)
    scale_x = (w * 0.5) / max(maxx, 1)
    # Estimate PDF scale (usually 150/72 = 2.0833 or 200/72 = 2.7778)
    s = 200/72.0 if maxy > 1250 else 150/72.0
    col_x0 = (0 if side == 'left' else w * 0.5) + max(0, bx0 / s - 25)
    col_x1 = (0 if side == 'left' else w * 0.5) + bx0 / s + 135
    py0 = max(25, by0 / s - 15)
    py1 = min(page.rect.height - 15, py0 + 135)
    pix = page.get_pixmap(dpi=220, clip=fitz.Rect(col_x0, py0, col_x1, py1))
    exp_ims.append((f"Exp Q{qt}", Image.open(io.BytesIO(pix.tobytes('png')))))

all_items = [(f"Q{q}", im) for q, im in ims] + exp_ims
COLS = 4
cw = max(im.width for _, im in all_items) + 12
rows = (len(all_items) + COLS - 1) // COLS
rhs = []
for r in range(rows):
    rc = all_items[r*COLS:(r+1)*COLS]
    rhs.append(max(im.height for _, im in rc) + 26)
canvas = Image.new('RGB', (COLS * cw + 10, sum(rhs) + 10), (255, 255, 255))
draw = ImageDraw.Draw(canvas)
y_off = 5
for r in range(rows):
    rc = all_items[r*COLS:(r+1)*COLS]
    for ci, (lbl, im) in enumerate(rc):
        x_off = ci * cw + 5
        draw.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(180,180,220))
        draw.text((x_off+2, y_off+2), lbl, fill=(200,0,0))
        canvas.paste(im, (x_off, y_off+20))
    y_off += rhs[r]
canvas.save('scripts/pdf_samples/t4_edge_and_exps_verify.png')
print("Saved scripts/pdf_samples/t4_edge_and_exps_verify.png")
