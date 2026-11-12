import json, re, sys, fitz, io
from PIL import Image, ImageDraw
sys.path.insert(0, 'scripts')
import solve_t4_254_v3 as v3

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

manually_verified = {1, 65, 121, 154, 155, 184, 185, 186, 187, 217}
need_visual = []
for item in raw:
    qn = item['q_num']
    if qn in manually_verified:
        continue
    fix = v3.manual.get(qn, {})
    ex = fix.get('exam_tag', item.get('exam_tag', ''))
    has_date = bool(re.search(r'\d{2}\.\d{2}\.\d{4}', ex))
    m_sh = re.search(r'(?:Shift|Shif|Slift|Shiff|Shft|Shit|Sht|Stif|Shir|Shin|Shi|Shtft|Shff|Siift)\s*[-:\.]?\s*([A-Za-z0-9]+)', ex, re.I)
    if has_date and ('Sitting' in ex or 'TFNo' in ex or 'Kolkata' in ex):
        continue
    if has_date and m_sh and m_sh.group(1) in {'I', 'II', 'III', 'IV'}:
        continue
    need_visual.append(qn)

print(f"Total rendering: {len(need_visual)} tiny exam strips")
doc = fitz.open('analogy_chapter2.pdf')
strips = []
for qn in need_visual:
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
    x0 = max(5, base + ci * cw - 10)
    x1 = min(w, base + (ci + 1) * cw + 52)
    y0 = max(25, max(ys) - 10)
    y1 = min(page.rect.height - 8, max(ys) + 18)
    pix = page.get_pixmap(dpi=220, clip=fitz.Rect(x0, y0, x1, y1))
    strips.append((qn, Image.open(io.BytesIO(pix.tobytes('png')))))

# Split into 3 chunks of ~57 each (3 cols x 19 rows, ~65px row = ~1250px tall!)
CH = (len(strips) + 2) // 3
for si in range(3):
    chunk = strips[si*CH:(si+1)*CH]
    if not chunk: continue
    COLS = 3
    cw = max(im.width for _, im in chunk) + 10
    rows = (len(chunk) + COLS - 1) // COLS
    rhs = [max(im.height for _, im in chunk[r*COLS:(r+1)*COLS]) + 22 for r in range(rows)]
    canvas = Image.new('RGB', (COLS * cw + 10, sum(rhs) + 10), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    y_off = 5
    for r in range(rows):
        for ci, (qn, im) in enumerate(chunk[r*COLS:(r+1)*COLS]):
            x_off = ci * cw + 5
            draw.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(190,190,220))
            draw.text((x_off+2, y_off+2), f"Q{qn}", fill=(200,0,0))
            canvas.paste(im, (x_off, y_off+15))
        y_off += rhs[r]
    outp = f"scripts/pdf_samples/t4_exam_crisp_{si+1}.png"
    canvas.save(outp)
    print(f"Saved {outp} ({len(chunk)} strips, {canvas.size})")
