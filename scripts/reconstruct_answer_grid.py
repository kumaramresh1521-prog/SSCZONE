import json
import re

with open('scripts/pdf_samples/t4_answer_table_all_boxes.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

tokens = []
for poly, text, conf in boxes:
    x = poly[0][0]
    y = poly[0][1]
    tokens.append((x, y, text.strip()))

# Regex matches
answers = {}
for x, y, t in tokens:
    matches = re.findall(r'(\d{1,3})\s*[\.\,\:\-]?\s*\(?([1-4])\)?', t)
    for q, a in matches:
        qn = int(q)
        if 1 <= qn <= 254:
            answers[qn] = int(a)

missing = [i for i in range(1, 255) if i not in answers]

print("=== RESOLVING MISSING VIA NEIGHBORS ===")
for q in missing:
    # Determine which band and row q belongs to
    # Band A: 1 to 80 (col = (q-1)%4, row = (q-1)//4)
    # Band B: 81 to 168 (col = (q-81)%4, row = (q-81)//4)
    # Band C: 169 to 254 (col = (q-169)%4, row = (q-169)//4)
    
    # Let's find tokens near where q should be
    # Find neighbors in same band (e.g. q-1 or q+1)
    cand_tokens = []
    for x, y, t in tokens:
        # Check if text contains parts of q or nearby
        if str(q) in t or any(f"{q}{sep}" in t for sep in ['.', ',', ' ']):
            cand_tokens.append((x, y, t))
    print(f"Q{q}: cand_tokens={cand_tokens}")

