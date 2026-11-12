from PIL import Image
from rapidocr_onnxruntime import RapidOCR
import re
import json

img = Image.open(r'c:\ssczone\scripts\pdf_samples\page_1.png')
w, h = img.size

# Right page is x from w/2 to w
right_page = img.crop((w // 2, 0, w, h))
right_page.save(r'c:\ssczone\scripts\pdf_samples\p1_right.png')

engine = RapidOCR()
res, _ = engine(r'c:\ssczone\scripts\pdf_samples\p1_right.png')

# Right page width is w // 2 (~877)
# It has 3 columns:
# Col 0: x < 290
# Col 1: 290 <= x < 585
# Col 2: x >= 585
cols = [[], [], []]
for box, text, score in res:
    x_mid = (box[0][0] + box[1][0]) / 2.0
    y_top = box[0][1]
    if x_mid < 290:
        cols[0].append((y_top, text))
    elif x_mid < 585:
        cols[1].append((y_top, text))
    else:
        cols[2].append((y_top, text))

for i in range(3):
    cols[i].sort(key=lambda x: x[0])

print("Col 0 text lines:", len(cols[0]))
print("Col 1 text lines:", len(cols[1]))
print("Col 2 text lines:", len(cols[2]))

# Print first 20 lines from Col 0
print("\n--- Sample Col 0 ---")
for y, t in cols[0][:20]:
    print(t)
