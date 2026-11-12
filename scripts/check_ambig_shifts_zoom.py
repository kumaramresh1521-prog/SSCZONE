import json, fitz, io
from PIL import Image, ImageDraw, ImageOps

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

doc = fitz.open('analogy_chapter2.pdf')

REST_AMBIG = [40, 44, 46, 81, 92, 111, 136, 143, 144, 145, 185, 186, 187]
SPINE_TINY = [151, 182, 183, 184, 213, 214, 215, 216, 245, 246, 247, 248, 249]

strips = []
for qn in REST_AMBIG + SPINE_TINY:
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
    x0 = max(0, base + ci * cw - 15)
    x1 = min(w, base + (ci + 1) * cw + 45)
    y0 = max(10, max(ys) - 20)
    y1 = min(page.rect.height - 5, max(ys) + 12)
    pix = page.get_pixmap(dpi=420, clip=fitz.Rect(x0, y0, x1, y1))
    im = Image.open(io.BytesIO(pix.tobytes('png')))
    if qn in SPINE_TINY:
        im = im.convert('L').point(lambda p: int(255 * ((p / 255.0) ** 0.35)))
        im = ImageOps.autocontrast(im, cutoff=1).convert('RGB')
    strips.append((qn, im))

COLS = 2
cw = max(im.width for _, im in strips) + 12
rows = (len(strips) + COLS - 1) // COLS
rhs = [max(im.height for _, im in strips[r*COLS:(r+1)*COLS]) + 26 for r in range(rows)]
c = Image.new('RGB', (COLS * cw + 10, sum(rhs) + 10), (255, 255, 255))
d = ImageDraw.Draw(c)
y_off = 5
for r in range(rows):
    for ci, (qn, im) in enumerate(strips[r*COLS:(r+1)*COLS]):
        x_off = ci * cw + 5
        d.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(170,170,210))
        d.text((x_off+3, y_off+2), f"Q{qn}", fill=(200,0,0))
        c.paste(im, (x_off, y_off+18))
    y_off += rhs[r]
c.save('scripts/pdf_samples/t4_ambig_shifts_all.png')
print("Saved scripts/pdf_samples/t4_ambig_shifts_all.png")
