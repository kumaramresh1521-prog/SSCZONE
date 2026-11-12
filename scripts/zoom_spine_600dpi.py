import json, re, sys, fitz, io
from PIL import Image, ImageDraw, ImageOps, ImageEnhance

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

doc = fitz.open('analogy_chapter2.pdf')

TARGETS = [151, 152, 153, 154, 155, 182, 183, 184, 213, 214, 215, 216, 217, 245, 246, 247, 248, 249]

strips = []
for qn in TARGETS:
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
    x0 = max(0, base + ci * cw - 40)
    x1 = min(w, base + (ci + 1) * cw + 95)
    y0 = max(10, max(ys) - 24)
    y1 = min(page.rect.height - 5, max(ys) + 18)
    pix = page.get_pixmap(dpi=450, clip=fitz.Rect(x0, y0, x1, y1))
    im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('L')
    # Boost dark shadows locally via gamma < 1 (brighten dark tones so text in gutter pops!)
    im = im.point(lambda p: int(255 * ((p / 255.0) ** 0.45)))
    im = ImageOps.autocontrast(im, cutoff=1).convert('RGB')
    strips.append((qn, im))

COLS = 2
cw = max(im.width for _, im in strips) + 16
rows = (len(strips) + COLS - 1) // COLS
rhs = [max(im.height for _, im in strips[r*COLS:(r+1)*COLS]) + 32 for r in range(rows)]
canvas = Image.new('RGB', (COLS * cw + 12, sum(rhs) + 12), (255, 255, 255))
draw = ImageDraw.Draw(canvas)
y_off = 6
for r in range(rows):
    for ci, (qn, im) in enumerate(strips[r*COLS:(r+1)*COLS]):
        x_off = ci * cw + 6
        draw.rectangle([x_off-2, y_off, x_off+cw-10, y_off+rhs[r]-4], outline=(180,180,220))
        draw.text((x_off+4, y_off+4), f"Q{qn} exam (450dpi gamma)", fill=(200,0,0))
        canvas.paste(im, (x_off, y_off+22))
    y_off += rhs[r]

canvas.save('scripts/pdf_samples/t4_exam_spine_600.png')
print("Saved scripts/pdf_samples/t4_exam_spine_600.png")

# Print ALL 70 exam tags that were NOT in render_3_crisp_exam_sheets.py (where real regex matches clean Shift-I..IV)
print("\n--- The ~70 'certain' exam tags skipped earlier ---")
for item in raw:
    qn = item['q_num']
    ex = item.get('exam_tag', '')
    # Original buggy check in render_3_crisp_exam_sheets: if it matched crisp Shift without hitting |S bug? No, let's check clean regex:
    m_date = re.search(r'(\d{2}\.\d{2}\.\d{4})', ex)
    m_sh = re.search(r'(?:Shift|Shif|Slift|Shiff|Shft|Shit|Sht|Stif|Shir|Shin|Shi)\s*[-:\.]?\s*([IVX]+)', ex)
    if m_date and m_sh and m_sh.group(1) in ('I','II','III','IV'):
        print(f"Q{qn:3d}: {ex}")
