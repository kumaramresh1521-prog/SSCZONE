import json, re, sys, fitz, io
from PIL import Image, ImageDraw
sys.path.insert(0, 'scripts')
import solve_t4_254_v2 as v2

def val(c): return ord(c.upper()) - 64
def opp(c): return chr(155 - ord(c.upper()))
VOWELS = set('AEIOU')

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = {q['q_num']: q for q in json.load(f)}

with open('scripts/pdf_samples/t4_explanations_all.json', 'r', encoding='utf-8') as f:
    expls = json.load(f)

check_qs = [29, 68, 70, 78, 82, 87, 96, 97, 100, 106, 110, 111, 113, 118, 120,
            128, 130, 132, 133, 139, 142, 143, 144, 146, 149, 155, 156, 158, 159,
            165, 166, 167, 172, 180, 181, 196, 200, 201, 202, 204, 206, 249]

print("=== DIAGNOSTIC OF PERMUTATIONS / SHIFTS / OPPOSITES ===")
for qn in check_qs:
    q = dict(raw[qn]); q.update(v2.manual.get(qn, {}))
    ans = v2.manual[qn]['correct_ans'] if (qn in v2.manual and 'correct_ans' in v2.manual[qn]) else v2.p40_ans[qn]
    ans_opt = q['options'][ans - 1]
    qt = v2.normalize_prompt(q['question_text'])
    if qn == 96: qt = qt.replace('LIGHIS', 'LIGHTS')
    if qn == 118: qt = qt.replace('TYPI. CAL', 'TYPICAL')
    if qn == 120: qt = qt.replace('QUAL ITY', 'QUALITY')
    if qn == 133: qt = qt + ' : ?'
    if qn == 149: qt = qt.replace('OMKBZOM', 'QOMKBZOM')
    if qn == 158: qt = qt.replace('KCH.GXS', 'KCH : GXS')
    if qn == 201: qt = qt.replace('DOC- 1TRINE', 'DOCTRINE')
    if qn == 204: qt = qt + ' : ?'

    kind, payload = v2.parse_q_v2(qt, q['options'])
    pairs = []
    if kind in ('one_ex_to_ans', 'two_ex_to_ans'):
        pairs = list(payload[:-1]) + [(payload[-1], ans_opt)]
    elif kind == 'ex_list_to_ans':
        pairs = list(payload[0]) + [(payload[1], ans_opt)]
    elif kind == 'rev_ex_to_ans':
        pairs = list(payload[0]) + [(ans_opt, payload[1])]
    print(f"\nQ{qn:3d} ({kind}) pairs={pairs}")
    for a, b in pairs:
        if len(a) == len(b) and a.isalpha():
            ds = [(ord(b[i]) - ord(a[i])) % 26 for i in range(len(a))]
            ds = [d - 26 if d > 13 else d for d in ds]
            rds = [(ord(b[i]) - ord(a[len(a)-1-i])) % 26 for i in range(len(a))]
            rds = [d - 26 if d > 13 else d for d in rds]
            ods = [(ord(b[i]) - ord(opp(a[i]))) % 26 for i in range(len(a))]
            ods = [d - 26 if d > 13 else d for d in ods]
            rods = [(ord(b[i]) - ord(opp(a[len(a)-1-i]))) % 26 for i in range(len(a))]
            rods = [d - 26 if d > 13 else d for d in rods]
            print(f"  {a} -> {b}: ds={ds} | rds={rds} | ods={ods} | rods={rods}")
        else:
            print(f"  {a} -> {b} (len {len(a)} -> {len(b)})")
    e = expls.get(str(qn), {})
    if e and e.get('text'):
        print(f"  EXP_OCR: {e.get('text')[:140]}")

# Also render unclipped exam tags for Q1, Q65, Q121, Q154, Q155, Q184, Q185, Q186, Q187, Q217
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}
doc = fitz.open('analogy_chapter2.pdf')
exam_qns = [1, 65, 121, 154, 155, 184, 185, 186, 187, 217]
ims = []
for qn in exam_qns:
    lines = segs[qn]['lines']
    by_col = {}
    for ln in lines:
        by_col.setdefault(ln['col_name'], []).append(ln['y'])
    # Take last col (exam tag is at bottom of question)
    cname, ys = list(by_col.items())[-1]
    m = cname.split('_')
    p_idx = int(m[0][1:]) - 1
    page = doc[p_idx]
    w = page.rect.width
    half_l_end = w * 0.50
    side, ci = m[1], int(m[2][1:])
    if side == 'l':
        cw = (half_l_end - 25) / 3.0
        x0 = max(5, 20 + ci * cw - 15)
        x1 = min(w, 20 + (ci + 1) * cw + 25)
    else:
        cw = (w - half_l_end - 20) / 3.0
        x0 = max(0, half_l_end + ci * cw - 15)
        x1 = min(w, half_l_end + (ci + 1) * cw + 25)
    y0 = max(25, max(ys) - 45)
    y1 = min(page.rect.height - 15, max(ys) + 38)
    pix = page.get_pixmap(dpi=240, clip=fitz.Rect(x0, y0, x1, y1))
    ims.append((qn, Image.open(io.BytesIO(pix.tobytes('png')))))

cw = max(im.width for _, im in ims) + 12
ch = max(im.height for _, im in ims) + 26
canvas = Image.new('RGB', (2 * cw + 10, 5 * ch + 10), (255, 255, 255))
draw = ImageDraw.Draw(canvas)
for idx, (qn, im) in enumerate(ims):
    r, c = idx // 2, idx % 2
    x0, y0 = c * cw + 5, r * ch + 5
    draw.rectangle([x0-2, y0, x0+cw-8, y0+ch-4], outline=(180,180,220))
    draw.text((x0+2, y0+2), f"Q{qn} EXAM TAG CHECK", fill=(200,0,0))
    canvas.paste(im, (x0, y0+18))
canvas.save('scripts/pdf_samples/t4_exam_tags_check.png')
print("\nSaved scripts/pdf_samples/t4_exam_tags_check.png")
