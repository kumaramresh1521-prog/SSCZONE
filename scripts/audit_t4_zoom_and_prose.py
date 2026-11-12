import json, re, sys, fitz, io
from PIL import Image, ImageDraw
sys.path.insert(0, 'scripts')

# Inspect the remaining ~22 zoomed exam tags + full prompts for Q87/Q169/Q184
# AND audit all 254 exam tags & prose cleanup.

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

# Also get manual fixes from solve_t4_254_v3 without running its loop
# Let's read solve_t4_254_v3 cleanly or exec up to manual? Better: parse/import after checking if guard exists.
with open('scripts/solve_t4_254_v3.py', 'r', encoding='utf-8') as f:
    v3_src = f.read()

# Check where loop starts in solve_t4_254_v3.py
print("solve_t4_254_v3 lines:", len(v3_src.splitlines()))

# Render 300 DPI wide strips for specific Qs
ZOOM_EXAM_QNS = [47, 60, 139, 151, 152, 153, 154, 155, 182, 183, 190, 191, 198, 213, 214, 215, 216, 245, 246, 247, 248, 249]
PROMPT_CHECK_QNS = [87, 169, 184]

doc = fitz.open('analogy_chapter2.pdf')

def render_q_strip(qn, full_question=False):
    lines = segs[qn]['lines']
    by_col = {}
    for ln in lines:
        by_col.setdefault(ln['col_name'], []).append(ln['y'])
    cname, ys = list(by_col.items())[-1]
    if full_question:
        cname, ys = list(by_col.items())[0]
    m = cname.split('_')
    p_idx = int(m[0][1:]) - 1
    page = doc[p_idx]
    w = page.rect.width
    half_l_end = w * 0.50
    side, ci = m[1], int(m[2][1:])
    cw = (half_l_end - 25)/3.0 if side == 'l' else (w - half_l_end - 20)/3.0
    base = 20 if side == 'l' else half_l_end
    # Wide margins especially into gutter
    x0 = max(5, base + ci * cw - 25)
    x1 = min(w - 2, base + (ci + 1) * cw + 65)
    if full_question:
        y0 = max(15, min(ys) - 18)
        y1 = min(page.rect.height - 10, max(ys) + 18)
    else:
        y0 = max(15, max(ys) - 34)
        y1 = min(page.rect.height - 10, max(ys) + 20)
    pix = page.get_pixmap(dpi=280, clip=fitz.Rect(x0, y0, x1, y1))
    return Image.open(io.BytesIO(pix.tobytes('png')))

strips = [(f"Q{qn} exam", render_q_strip(qn, False)) for qn in ZOOM_EXAM_QNS]
for qn in PROMPT_CHECK_QNS:
    strips.append((f"Q{qn} prompt", render_q_strip(qn, True)))

COLS = 2
cw = max(im.width for _, im in strips) + 16
rows = (len(strips) + COLS - 1) // COLS
rhs = [max(im.height for _, im in strips[r*COLS:(r+1)*COLS]) + 28 for r in range(rows)]
canvas = Image.new('RGB', (COLS * cw + 12, sum(rhs) + 12), (255, 255, 255))
draw = ImageDraw.Draw(canvas)
y_off = 6
for r in range(rows):
    for ci, (lbl, im) in enumerate(strips[r*COLS:(r+1)*COLS]):
        x_off = ci * cw + 6
        draw.rectangle([x_off-2, y_off, x_off+cw-10, y_off+rhs[r]-4], outline=(160,160,210))
        draw.text((x_off+4, y_off+3), lbl, fill=(200,0,0))
        canvas.paste(im, (x_off, y_off+20))
    y_off += rhs[r]

canvas.save('scripts/pdf_samples/t4_exam_spine_zoom.png')
print("Saved scripts/pdf_samples/t4_exam_spine_zoom.png")

# Print the 70 "certain" exam tags that were skipped in crisp sheets so we can inspect them as text
uncertain_set = set()
manually_verified_exams = {1, 65, 121, 154, 155, 184, 185, 186, 187, 217}
ns = {}
exec(v3_src.split('# Run strict verification')[0] if '# Run strict verification' in v3_src else v3_src[:v3_src.find('\nresults = ')], ns)
manual = ns.get('manual', {})

print("\n--- Checking all 'certain' exam tags (not in uncertain_qns) ---")
for item in raw:
    qn = item['q_num']
    ex = manual.get(qn, {}).get('exam_tag', item.get('exam_tag', ''))
    m_date = re.search(r'(\d{2}\.\d{2}\.\d{4})', ex)
    m_sh = re.search(r'(?:Shift|Shif|Slift|Shiff|Shft|Shit|Sht|Stif|Shir|Shin|Shi|S)\s*[-:\.]?\s*([A-Za-z0-9]*)', ex)
    is_unc = not m_date or ('Sitting' not in ex and 'TFNo' not in ex and (not m_sh or not re.match(r'^(I|II|III|IV)$', m_sh.group(1) or '')))
    if not is_unc and qn not in manually_verified_exams:
        print(f"Q{qn:3d}: {ex}")
