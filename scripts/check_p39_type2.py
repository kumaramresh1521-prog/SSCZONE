from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json

im39 = Image.open(r'c:\ssczone\scripts\pdf_samples\answers_spread_p39.png')
w, h = im39.size
# Crop right half where answer table is
right_crop = im39.crop((w // 2, 0, w, h))

engine = RapidOCR()
res, _ = engine(np.array(right_crop))

# Look for TYPE-II or numbers
type2_lines = []
found_type2 = False
for box, txt, score in res:
    if 'TYPE' in txt.upper() and ('II' in txt.upper() or '2' in txt):
        found_type2 = True
        print(f"Found TYPE-II in p39 at y={box[0][1]}: {txt}")
    if found_type2:
        type2_lines.append(txt)

print(f"Total lines after TYPE-II header on p39: {len(type2_lines)}")
if type2_lines:
    print("Sample lines:", type2_lines[:15])
