from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json

engine = RapidOCR()
img = Image.open('scripts/pdf_samples/t4_left_page.png')

# Let's inspect all boxes from t4_left_page.png
res, _ = engine(np.array(img))

all_text = []
for b, t, s in res:
    all_text.append(f"{t} (x={b[0][0]:.0f}, y={b[0][1]:.0f})")

# Look for some of the missing numbers, e.g. 11, 26, 30, 77-80, 164-172
missing_targets = [11, 26, 30, 77, 78, 79, 80, 165, 166, 167, 168]
print("Searching for missing targets in OCR raw output:")
for line in all_text:
    for m in missing_targets:
        if f"{m}." in line or f"{m} " in line or f"{m}(" in line or f"{m}-" in line or f"{m}," in line:
            print(line)
