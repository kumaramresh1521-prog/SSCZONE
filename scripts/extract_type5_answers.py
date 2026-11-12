from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

print("=== STEP 1: PARSING ALL 25 TYPE-V ANSWERS ===")
# Answers on Page 40 left page bottom right
im40 = Image.open('scripts/pdf_samples/t5_left_page.png')
res40, _ = engine(np.array(im40))

ans_v = {}
for b, text, s in res40:
    m = re.findall(r'(?:^|[^\d])([1-9]|1[0-9]|2[0-5])\s*[\.\,\)]\s*\(?([1-4])\)?', text)
    for q, a in m:
        num = int(q)
        if 1 <= num <= 25 and num not in ans_v:
            ans_v[num] = int(a)

print(f"Parsed {len(ans_v)} answers for Type-V:")
for i in range(1, 26):
    print(f"Q{i}: {ans_v.get(i, 'MISSING')}", end=" | " if i % 5 != 0 else "\n")

# Map 1->A, 2->B, 3->C, 4->D
opt_map = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}
ans_letters = {i: opt_map.get(ans_v.get(i), '') for i in range(1, 26)}
with open('type5_answers.json', 'w', encoding='utf-8') as f:
    json.dump(ans_letters, f, indent=2)

print("\nSaved type5_answers.json")
