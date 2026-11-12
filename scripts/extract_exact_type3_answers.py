from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json

engine = RapidOCR()
all_answers = {}

# 1. P39: x in [720, 1150], y in [90, 500] of crop39
im39 = Image.open('scripts/pdf_samples/answer_table_p39_200dpi.png')
w39, h39 = im39.size
# crop right half, bottom 35%
p39_box = (w39 // 2 + 700, int(h39 * 0.65) + 80, w39, h39)
crop39_t3 = im39.crop(p39_box)
crop39_t3.save('scripts/pdf_samples/type3_ans_p39.png')
res39, _ = engine(np.array(crop39_t3))
for b, text, s in res39:
    m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q, a in m:
        num = int(q)
        if 1 <= num <= 36:
            all_answers[num] = int(a)

print(f"P39 extracted {len(all_answers)} answers (Q1-Q36):", sorted(list(all_answers.keys())))

# 2. P40: from y=50 to y=460 of the upper left
im40 = Image.open('scripts/pdf_samples/answer_table_p40_200dpi.png')
w40, h40 = im40.size
crop40_t3 = im40.crop((0, 50, w40 // 2, int(h40 * 0.35)))
crop40_t3.save('scripts/pdf_samples/type3_ans_p40.png')

# To get all columns reliably without merging, slice crop40_t3 horizontally or by column bands
res40, _ = engine(np.array(crop40_t3))
for b, text, s in res40:
    m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q, a in m:
        num = int(q)
        if 37 <= num <= 257:
            all_answers[num] = int(a)

print(f"Total extracted so far: {len(all_answers)} / 257")
missing = [i for i in range(1, 258) if i not in all_answers]
print(f"Missing count: {len(missing)}")
if missing:
    print(f"Missing numbers: {missing}")

with open('type3_answers_complete.json', 'w') as f:
    json.dump(all_answers, f, indent=2)
