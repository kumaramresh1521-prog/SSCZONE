import json, fitz, io
from PIL import Image, ImageDraw
from collections import Counter

with open('scripts/pdf_samples/t4_clean_stream.json', 'r', encoding='utf-8') as f:
    cs = json.load(f)
cols_meta = cs['cols']
print("cols sample:", type(cols_meta), list(cols_meta.items())[:2] if isinstance(cols_meta, dict) else cols_meta[:2])

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed = {q['q_num']: q for q in json.load(f)}

doc = fitz.open('analogy_chapter2.pdf')

# Build col_name -> (page_idx, x0, x1) map carefully
# Inspect col_meta structure dynamically
col_rect_map = {}
if isinstance(cols_meta, dict):
    for cname, info in cols_meta.items():
        col_rect_map[cname] = info
elif isinstance(cols_meta, list):
    for info in cols_meta:
        cname = info.get('col_name') or info.get('name')
        col_rect_map[cname] = info

check_qns = [27, 65, 76, 87, 92, 96, 103, 121, 133, 145, 149, 150, 153, 154, 155, 158, 176, 184, 185, 186, 187, 195, 201, 204, 209, 215, 217, 220]

def get_q_crop(qn):
    seg = segs[qn]
    lines = seg['lines']
    # Group by col_name preserving order
    by_col = {}
    for ln in lines:
        by_col.setdefault(ln['col_name'], []).append(ln['y'])
    parts = []
    for cname, ys in by_col.items():
        # parse pXX_{l|r}_cY or use col_rect_map
        info = col_rect_map.get(cname, {})
        # Fallback parse p32_l_c1
        m = cname.split('_')
        p_idx = info.get('page_idx', int(m[0][1:]) - 1)
        page = doc[p_idx]
        w = page.rect.width
        half_l_end = w * 0.50
        side = m[1]
        ci = int(m[2][1:])
        if side == 'l':
            # 3 columns on left half
            cw = (half_l_end - 25) / 3.0
            x0 = max(10, 20 + ci * cw - 6)
            x1 = min(w, 20 + (ci + 1) * cw + 8)
        else:
            cw = (w - half_l_end - 20) / 3.0
            x0 = max(0, half_l_end + ci * cw - 6)
            x1 = min(w, half_l_end + (ci + 1) * cw + 8)
        if 'x0' in info and 'x1' in info:
            x0, x1 = info['x0'] - 6, info['x1'] + 6
        y0 = max(25, min(ys) - 18)
        y1 = min(page.rect.height - 20, max(ys) + 32)
        pix = page.get_pixmap(dpi=210, clip=fitz.Rect(x0, y0, x1, y1))
        parts.append(Image.open(io.BytesIO(pix.tobytes('png'))))
    if len(parts) == 1:
        return parts[0]
    mw = max(p.width for p in parts)
    sh = sum(p.height + 4 for p in parts)
    im = Image.new('RGB', (mw, sh), (255, 255, 255))
    yy = 0
    for p in parts:
        im.paste(p, (0, yy))
        yy += p.height + 4
    return im

crops = [(qn, get_q_crop(qn)) for qn in check_qns]
for sheet_i in range(2):
    chunk = crops[sheet_i*14:(sheet_i+1)*14]
    COLS = 4
    cw = max(im.width for _, im in chunk) + 12
    rows = (len(chunk) + COLS - 1) // COLS
    rhs = []
    for r in range(rows):
        row_c = chunk[r*COLS:(r+1)*COLS]
        rhs.append(max(im.height for _, im in row_c) + 26)
    canvas = Image.new('RGB', (COLS * cw + 10, sum(rhs) + 10), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    y_off = 5
    for r in range(rows):
        row_c = chunk[r*COLS:(r+1)*COLS]
        for ci, (qn, im) in enumerate(row_c):
            x_off = ci * cw + 5
            draw.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(180,180,220))
            draw.text((x_off+2, y_off+2), f"Q{qn}", fill=(200,0,0))
            canvas.paste(im, (x_off, y_off+20))
        y_off += rhs[r]
    outp = f"scripts/pdf_samples/t4_check_prompts_{sheet_i+1}.png"
    canvas.save(outp)
    print(f"Saved {outp}")
