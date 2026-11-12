import json, fitz, io
from PIL import Image, ImageDraw

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = {it['q_num']: it for it in json.load(f)}
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

QNS = [41, 73, 102, 107, 140, 228]
for qn in QNS:
    print(f"Q{qn}: {raw[qn]['question_text']}")

doc = fitz.open('analogy_chapter2.pdf')
strips = []
for qn in QNS:
    lines = segs[qn]['lines']
    by_col = {}
    for ln in lines:
        by_col.setdefault(ln['col_name'], []).append(ln['y'])
    cname, ys = list(by_col.items())[0]
    m = cname.split('_')
    p_idx = int(m[0][1:]) - 1
    page = doc[p_idx]
    w = page.rect.width
    half_l_end = w * 0.50
    side, ci = m[1], int(m[2][1:])
    cw = (half_l_end - 25)/3.0 if side == 'l' else (w - half_l_end - 20)/3.0
    base = 20 if side == 'l' else half_l_end
    x0 = max(5, base + ci * cw - 12)
    x1 = min(w - 2, base + (ci + 1) * cw + 30)
    y0 = max(15, min(ys) - 18)
    y1 = min(page.rect.height - 10, max(ys) + 18)
    pix = page.get_pixmap(dpi=220, clip=fitz.Rect(x0, y0, x1, y1))
    strips.append((qn, Image.open(io.BytesIO(pix.tobytes('png')))))

COLS = 3
cw = max(im.width for _, im in strips) + 10
rows = (len(strips) + COLS - 1) // COLS
rhs = [max(im.height for _, im in strips[r*COLS:(r+1)*COLS]) + 26 for r in range(rows)]
c = Image.new('RGB', (COLS * cw + 10, sum(rhs) + 10), (255, 255, 255))
d = ImageDraw.Draw(c)
y_off = 5
for r in range(rows):
    for ci, (qn, im) in enumerate(strips[r*COLS:(r+1)*COLS]):
        x_off = ci * cw + 5
        d.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(180,180,210))
        d.text((x_off+3, y_off+2), f"Q{qn}", fill=(200,0,0))
        c.paste(im, (x_off, y_off+18))
    y_off += rhs[r]
c.save('scripts/pdf_samples/t4_6prompts_check.png')
print("Saved t4_6prompts_check.png")
