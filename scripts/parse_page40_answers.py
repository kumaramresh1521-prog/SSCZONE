from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json

engine = RapidOCR()
img = Image.open('scripts/pdf_samples/page_40.png')
w, h = img.size
print(f"Page 40 dimensions: {w} x {h}")

# Type-IV is from y=350 to y=840
crop_t4 = img.crop((0, 350, w, 840))
crop_t4.save('scripts/pdf_samples/crop_type4_answers.png')

res_t4, _ = engine(np.array(crop_t4))

t4_answers = {}
for b, text, s in res_t4:
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q, a in matches:
        qn = int(q)
        if 1 <= qn <= 260:
            t4_answers[qn] = int(a)

print(f"Type-IV extracted answers: count = {len(t4_answers)}")
if t4_answers:
    print(f"Type-IV min: {min(t4_answers.keys())}, max: {max(t4_answers.keys())}")
    missing_t4 = [i for i in range(1, max(t4_answers.keys()) + 1) if i not in t4_answers]
    print(f"Type-IV missing numbers up to max: {missing_t4}")

# Type-V is from y=840 to h
crop_t5 = img.crop((0, 840, w, h))
crop_t5.save('scripts/pdf_samples/crop_type5_answers.png')

res_t5, _ = engine(np.array(crop_t5))

t5_answers = {}
for b, text, s in res_t5:
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q, a in matches:
        qn = int(q)
        if 1 <= qn <= 250:
            t5_answers[qn] = int(a)

print(f"\nType-V extracted answers: count = {len(t5_answers)}")
if t5_answers:
    print(f"Type-V min: {min(t5_answers.keys())}, max: {max(t5_answers.keys())}")
    missing_t5 = [i for i in range(1, max(t5_answers.keys()) + 1) if i not in t5_answers]
    print(f"Type-V missing numbers up to max: {missing_t5}")

# Save raw answers
with open('type4_answers_clean.json', 'w', encoding='utf-8') as f:
    json.dump(t4_answers, f, indent=2)

with open('type5_answers_clean.json', 'w', encoding='utf-8') as f:
    json.dump(t5_answers, f, indent=2)
