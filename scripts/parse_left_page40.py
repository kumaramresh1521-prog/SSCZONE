from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

img = Image.open('scripts/pdf_samples/answers_spread_p40.png')
w, h = img.size
mid_x = w // 2  # 877

print(f"Spread dimensions: {w} x {h}, mid_x={mid_x}")

# 1. Type-IV answers: Left page, y from 340 to 840
crop_t4 = img.crop((0, 340, mid_x, 840))
crop_t4.save('scripts/pdf_samples/t4_left_page.png')
res_t4, _ = engine(np.array(crop_t4))

t4_answers = {}
for b, text, s in res_t4:
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q, a in matches:
        qn = int(q)
        if 1 <= qn <= 254:
            t4_answers[qn] = int(a)

print(f"Type-IV extracted answers: count = {len(t4_answers)} / 254")
missing_t4 = [i for i in range(1, 255) if i not in t4_answers]
print(f"Type-IV missing numbers: {missing_t4}")

# 2. Type-V answers: Left page, y from 835 to 1241
crop_t5 = img.crop((0, 835, mid_x, h))
crop_t5.save('scripts/pdf_samples/t5_left_page.png')
res_t5, _ = engine(np.array(crop_t5))

t5_answers = {}
for b, text, s in res_t5:
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q, a in matches:
        qn = int(q)
        if 1 <= qn <= 212:
            t5_answers[qn] = int(a)

print(f"\nType-V extracted answers: count = {len(t5_answers)} / 212")
missing_t5 = [i for i in range(1, 213) if i not in t5_answers]
print(f"Type-V missing numbers: {missing_t5}")

# Save
with open('type4_answers_left.json', 'w', encoding='utf-8') as f:
    json.dump(t4_answers, f, indent=2)

with open('type5_answers_left.json', 'w', encoding='utf-8') as f:
    json.dump(t5_answers, f, indent=2)
