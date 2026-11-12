from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
engine = RapidOCR()

im40 = Image.open('scripts/pdf_samples/answers_spread_p40.png')
w, h = im40.size
left = im40.crop((0, 0, w//2, h))
res, _ = engine(np.array(left))

print("=== ALL TEXT IN answers_spread_p40.png LEFT HALF ===")
for b, text, s in sorted(res, key=lambda it: (it[0][0][1], it[0][0][0])):
    if 'TYPE' in text.upper() or 'ANSWERS' in text.upper() or any(c.isalpha() for c in text):
        print(f"y={b[0][1]:.0f}, x={b[0][0]:.0f}: {text}")
