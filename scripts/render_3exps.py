import json, os, re, fitz, io
from PIL import Image, ImageDraw

doc = fitz.open('analogy_chapter2.pdf')
# Search keywords TURNIP / QOMK / PLAN / XPEJ / BANK / 132 / 149 / 172 across exp_p*.json
targets = [
    (132, ['exp_p63_left.json', 'exp_p63_right.json'], r'TURNIP|RADISH|\b132[\.\s]'),
    (149, ['exp_p64_left.json', 'exp_p64_right.json'], r'PLAN|QOMK|SINK|RUDE|\b149[\.\s]'),
    (172, ['exp_p65_left.json', 'exp_p65_right.json'], r'YOUR|XPEJ|TONE|BANK|ABL|\b172[\.\s]'),
]
crops = []
for qn, fns, pat in targets:
    for fn in fns:
        with open(os.path.join('scripts/pdf_samples/t4_robust', fn), 'r', encoding='utf-8') as f:
            boxes = json.load(f)
        maxx = max(max(p[0] for p in b[0]) for b in boxes)
        maxy = max(max(p[1] for p in b[0]) for b in boxes)
        m = re.match(r'exp_p(\d+)_(left|right)\.json', fn)
        p_idx, side = int(m.group(1)) - 1, m.group(2)
        page = doc[p_idx]; w, h = page.rect.width, page.rect.height
        hits = [b for b in boxes if re.search(pat, b[1], re.I)]
        for box, txt, _ in hits[:2]:
            # Normalize box proportionally assuming left/right halfpage
            nx = min(p[0] for p in box) / max(maxx, 1)
            ny = min(p[1] for p in box) / max(maxy, 1)
            base_x = 0 if side == 'left' else w * 0.5
            px = base_x + nx * (w * 0.5)
            py = 35 + ny * (h - 70)
            cx0 = max(0, px - 60)
            cx1 = min(w, px + 140)
            cy0 = max(20, py - 30)
            cy1 = min(h - 15, py + 150)
            pix = page.get_pixmap(dpi=230, clip=fitz.Rect(cx0, cy0, cx1, cy1))
            crops.append((f"Q{qn} ({txt[:16]})", Image.open(io.BytesIO(pix.tobytes('png')))))

COLS = 3
cw = max(im.width for _, im in crops) + 12
rows = (len(crops) + COLS - 1) // COLS
rhs = [max(im.height for _, im in crops[r*COLS:(r+1)*COLS]) + 26 for r in range(rows)]
canvas = Image.new('RGB', (COLS * cw + 10, sum(rhs) + 10), (255, 255, 255))
draw = ImageDraw.Draw(canvas)
y_off = 5
for r in range(rows):
    for ci, (lbl, im) in enumerate(crops[r*COLS:(r+1)*COLS]):
        x_off = ci * cw + 5
        draw.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(180,180,220))
        draw.text((x_off+2, y_off+2), lbl, fill=(200,0,0))
        canvas.paste(im, (x_off, y_off+20))
    y_off += rhs[r]
canvas.save('scripts/pdf_samples/t4_3exps.png')
print("Saved t4_3exps.png, count=", len(crops))
