import json
import re

with open('scripts/pdf_samples/t5_expl_ocr.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print("=== ALL ITEMS IN t5_expl_ocr.json ===")
lines = []
for b, t, s in items:
    lines.append((b[0][1], b[0][0], t))

# Sort by y then x
lines.sort(key=lambda item: (item[0], item[1]))

# Group by question
expl_by_q = {}
cur_q = None
cur_text = []

for y, x, t in lines:
    m = re.match(r'^([1-9]|1[0-9]|2[0-5])\s*[\.\,\)]\s*\(?([1-4])\)?(.*)', t)
    if m:
        if cur_q is not None:
            expl_by_q[cur_q] = " ".join(cur_text)
        cur_q = int(m.group(1))
        ans_num = int(m.group(2))
        rest = m.group(3).strip()
        cur_text = [f"({ans_num}) {rest}"]
    else:
        if cur_q is not None:
            cur_text.append(t)

if cur_q is not None:
    expl_by_q[cur_q] = " ".join(cur_text)

print(f"Found explanations for {len(expl_by_q)} questions: {sorted(expl_by_q.keys())}")
for q in sorted(expl_by_q.keys()):
    print(f"\n--- Q{q} ---")
    print(expl_by_q[q][:200])
