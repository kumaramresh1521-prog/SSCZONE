from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

im39 = Image.open('scripts/pdf_samples/page_39.png')
res39, _ = engine(np.array(im39))

type3_items_39 = []
for box, text, score in res39:
    y = box[0][1]
    if y >= 450: # below TYPE-III header
        type3_items_39.append((y, box[0][0], text))

print(f"Page 39 below y=450: {len(type3_items_39)} items.")

im40 = Image.open('scripts/pdf_samples/page_40.png')
res40, _ = engine(np.array(im40))

type3_items_40 = []
for box, text, score in res40:
    y = box[0][1]
    # check if before TYPE-IV or TYPE-V
    type3_items_40.append((y, box[0][0], text))

all_text = " ".join([t[2] for t in type3_items_39] + [t[2] for t in type3_items_40])

# Let's find all question numbers in Page 39 under TYPE-III
matches39 = []
for y, x, txt in sorted(type3_items_39, key=lambda it: (it[0], it[1])):
    m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', txt)
    if m:
        matches39.extend(m)

print(f"Matches on Page 39 under TYPE-III: {len(matches39)}")
if matches39:
    nums = [int(q) for q, a in matches39]
    print(f"Min Q: {min(nums)}, Max Q: {max(nums)}")
    print(f"First 10: {matches39[:10]}")
    print(f"Last 10: {matches39[-10:]}")

# Now let's inspect what is on Page 40 before TYPE-V / other headers
matches40 = []
for box, txt, score in res40:
    m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', txt)
    if m:
        for q, a in m:
            matches40.append((int(q), int(a), box[0][1], box[0][0], txt))

print(f"Total question-like matches on Page 40: {len(matches40)}")
# Group by header on page 40
headers_p40 = [(box[0][1], txt) for box, txt, score in res40 if 'TYPE' in txt.upper()]
print("Page 40 headers:", headers_p40)
