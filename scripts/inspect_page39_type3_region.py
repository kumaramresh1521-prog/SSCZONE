from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

im = Image.open('scripts/pdf_samples/page_39.png')
res, _ = engine(np.array(im))

# Filter boxes where y >= 450 and x >= 700
t3_boxes = []
for box, text, score in res:
    if box[0][1] >= 450 and box[0][0] >= 700:
        t3_boxes.append((box[0][1], box[0][0], text))

print(f"Detected {len(t3_boxes)} boxes in Type-III region on page_39.png:")
for y, x, text in sorted(t3_boxes, key=lambda it: (it[0], it[1])):
    print(f"  y={y:.1f}, x={x:.1f}: {text}")

# Extract all question numbers and answers
all_txt = " ".join([t[2] for t in t3_boxes])
matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', all_txt)
nums = [int(q) for q, a in matches]
print("\nType-III Matches Summary:")
print(f"Total question-answer pairs: {len(matches)}")
print(f"Min Q: {min(nums) if nums else None}, Max Q: {max(nums) if nums else None}")
