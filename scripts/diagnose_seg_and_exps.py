import fitz
import json
import os
import re

doc = fitz.open('analogy_chapter2.pdf')

with open('scripts/pdf_samples/t4_clean_stream.json', 'r', encoding='utf-8') as f:
    stream = json.load(f)

print("=== CLEAN STREAM COLUMNS SUMMARY ===")
for ci, col in enumerate(stream['cols']):
    lns = col['lines']
    first_t = lns[0]['text'][:40] if lns else ''
    last_t = lns[-1]['text'][:40] if lns else ''
    print(f"  [{ci:2d}] {col['name']:10s} n={len(lns):3d} | first={first_t!r} | last={last_t!r}")

print("\n=== CHECK SEG_QS END & EXPLICIT NUMBERS ===")
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    seg_qs = json.load(f)
for q in seg_qs[::15] + seg_qs[-15:]:
    cols = sorted(set((l['col'], l['col_name']) for l in q['lines']))
    print(f"  Q{q['q_num']:3d}: cols={cols} lines={len(q['lines'])} line0={q['lines'][0]['line'][:55]!r}")

# Check where Q246 ('WISK') and Answer Key Table appear in PDF using OCR files
print("\n=== CHECK HALF_150DPI FILES FOR Q246 / TYPE-V / ANS KEY ===")
half_dir = 'scripts/pdf_samples/t4_half_150dpi'
for fn in sorted(os.listdir(half_dir)):
    if fn.endswith('.json'):
        with open(os.path.join(half_dir, fn), 'r', encoding='utf-8') as f:
            d = json.load(f)
        hits = [it['text'] for it in d if any(k in it['text'].upper() for k in ['WISK', 'TYPE-V', 'OGMI', 'VNTP', 'ANSWER', '161.', '162.', '254.'])]
        if hits:
            print(f"  {fn}: hits={hits[:6]}")

# Also render pages 55..58 (0-based 54..57) thumbnails or check t4_robust dir
print("\n=== T4_ROBUST FILES ===")
print(sorted(os.listdir('scripts/pdf_samples/t4_robust')))

# Render Type-IV Answer Key check (let's check doc pages 55..59 via robust files or quick render)
for p_idx in [35, 36, 37, 56, 57, 58]:
    pix = doc[p_idx].get_pixmap(dpi=120)
    pix.save(f'scripts/pdf_samples/check_doc_p{p_idx+1}.png')
print("Saved check_doc_p36,37,38,57,58,59.png")
