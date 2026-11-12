from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
engine = RapidOCR()

im39 = Image.open('scripts/pdf_samples/page_39.png')
res39, _ = engine(np.array(im39))

# Crop only the Type-III answer section on Page 39: y >= 450
t3_lines = []
for box, text, score in res39:
    if box[0][1] >= 450 and box[0][0] >= 400: # right side / lower part
        t3_lines.append(text)

all_t3 = " ".join(t3_lines)
matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', all_t3)
nums = sorted(list(set(int(q) for q, a in matches)))
print("Detected Question Numbers in Type-III Answer Key on Page 39:")
print(f"Total count detected: {len(nums)}")
print(f"Min: {min(nums) if nums else None}, Max: {max(nums) if nums else None}")
print("Numbers found:", nums)

# Also let's check Page 40 top (y < 450)
im40 = Image.open('scripts/pdf_samples/page_40.png')
res40, _ = engine(np.array(im40))
p40_lines = []
for box, text, score in res40:
    if box[0][1] < 450:
        p40_lines.append((box[0][1], box[0][0], text))

print("\nPage 40 top lines:")
for y, x, t in sorted(p40_lines, key=lambda it: (it[0], it[1]))[:20]:
    print(f"  y={y:.1f}, x={x:.1f}: {t}")
