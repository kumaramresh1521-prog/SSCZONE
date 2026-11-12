import json, os, re, fitz, io
from PIL import Image, ImageDraw

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

doc = fitz.open('analogy_chapter2.pdf')
# Render Q113 question crop
lines = segs[113]['lines']
by_col = {}
for ln in lines:
    by_col.setdefault(ln['col_name'], []).append(ln['y'])
parts = []
for cname, ys in by_col.items():
    m = cname.split('_')
    p_idx = int(m[0][1:]) - 1
    page = doc[p_idx]
    w = page.rect.width
    half_l_end = w * 0.50
    side, ci = m[1], int(m[2][1:])
    cw = (half_l_end - 25)/3.0 if side == 'l' else (w - half_l_end - 20)/3.0
    base = 20 if side == 'l' else half_l_end
    x0 = max(5, base + ci * cw - 12)
    x1 = min(w, base + (ci + 1) * cw + 35)
    pix = page.get_pixmap(dpi=250, clip=fitz.Rect(x0, max(25, min(ys)-15), x1, min(page.rect.height-15, max(ys)+32)))
    parts.append(Image.open(io.BytesIO(pix.tobytes('png'))))

# Also search exp_*.json for Q113 or STEADY / WORTHY / ANKLET / KANTEL
for fn in sorted(os.listdir('scripts/pdf_samples/t4_robust')):
    if fn.startswith('exp_') and fn.endswith('.json'):
        with open(os.path.join('scripts/pdf_samples/t4_robust', fn), 'r', encoding='utf-8') as f:
            boxes = json.load(f)
        for box, txt, _ in boxes:
            if any(k in txt.upper() for k in ['STEADY', 'WORTHY', 'ANKLET', 'KANTEL', '113.']):
                print("MATCH:", fn, txt)
                m = re.match(r'exp_p(\d+)_(left|right)\.json', fn)
                p_idx, side = int(m.group(1)) - 1, m.group(2)
                page = doc[p_idx]; w, h = page.rect.width, page.rect.height
                maxx = max(max(p[0] for p in b[0]) for b in boxes)
                maxy = max(max(p[1] for p in b[0]) for b in boxes)
                nx = min(p[0] for p in box) / max(maxx, 1)
                ny = min(p[1] for p in box) / max(maxy, 1)
                px = (0 if side=='left' else w*0.5) + nx*(w*0.5)
                py = 35 + ny*(h-70)
                pix = page.get_pixmap(dpi=250, clip=fitz.Rect(max(0, px-50), max(20, py-30), min(w, px+140), min(h-15, py+140)))
                parts.append(Image.open(io.BytesIO(pix.tobytes('png'))))

mw = sum(p.width for p in parts) + 10*(len(parts)+1)
mh = max(p.height for p in parts) + 10
c = Image.new('RGB', (mw, mh), (255,255,255))
xx = 10
for p in parts:
    c.paste(p, (xx, 5)); xx += p.width + 10
c.save('scripts/pdf_samples/t4_q113_check.png')
print("Saved scripts/pdf_samples/t4_q113_check.png, parts=", len(parts))
