from PIL import Image
from rapidocr_onnxruntime import RapidOCR
import re

img = Image.open(r'c:\ssczone\scripts\pdf_samples\expl_pages\expl_p40.png')
# right half
w, h = img.size
right_page = img.crop((w // 2, 0, w, h))
right_page.save(r'c:\ssczone\scripts\pdf_samples\expl_pages\p40_right.png')

engine = RapidOCR()
res, _ = engine(r'c:\ssczone\scripts\pdf_samples\expl_pages\p40_right.png')

print(f"Detected {len(res)} text lines in p40_right")
# Find headers like "1. (2)" or "14. (2)"
for box, text, score in res:
    if re.search(r'^\s*\d{1,3}\s*[\.\)]\s*\([1-4]\)', text):
        print(f"Header: {text} at y={box[0][1]:.1f}")
