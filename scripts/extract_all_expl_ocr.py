import os
import re
import json
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()

images = [
    (r'c:\ssczone\scripts\pdf_samples\page_39_highres.png', 'p39'),
    (r'c:\ssczone\scripts\pdf_samples\expl_pages\expl_p40.png', 'p40'),
    (r'c:\ssczone\scripts\pdf_samples\expl_pages\expl_p41.png', 'p41'),
    (r'c:\ssczone\scripts\pdf_samples\expl_pages\expl_p42.png', 'p42'),
    (r'c:\ssczone\scripts\pdf_samples\expl_pages\expl_p43.png', 'p43'),
]

all_lines = []

for img_path, label in images:
    if not os.path.exists(img_path):
        continue
    print(f"Running OCR on {label}...")
    res, _ = engine(img_path)
    if res:
        # Sort lines top-to-bottom, left-to-right (2 columns)
        # Check image width
        from PIL import Image
        im = Image.open(img_path)
        w, h = im.size
        col_split = w / 2
        
        col1 = []
        col2 = []
        for box, txt, score in res:
            # box is 4 points: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
            cx = (box[0][0] + box[1][0]) / 2
            cy = (box[0][1] + box[2][1]) / 2
            if cx < col_split:
                col1.append((cy, txt))
            else:
                col2.append((cy, txt))
                
        col1.sort(key=lambda x: x[0])
        col2.sort(key=lambda x: x[0])
        
        for cy, txt in col1:
            all_lines.append((label, 'col1', cy, txt))
        for cy, txt in col2:
            all_lines.append((label, 'col2', cy, txt))

print(f"Total lines extracted: {len(all_lines)}")

with open('all_expl_ocr_lines.json', 'w', encoding='utf-8') as f:
    json.dump(all_lines, f, ensure_ascii=False, indent=2)

print("Saved all_expl_ocr_lines.json")
