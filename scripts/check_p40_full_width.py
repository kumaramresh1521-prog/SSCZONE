from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re

engine = RapidOCR()
im40 = Image.open('scripts/pdf_samples/answer_table_p40_200dpi.png')
w, h = im40.size

# Check upper strip: y from 50 to 550, full width w
upper_strip = im40.crop((0, 50, w, 550))
upper_strip.save('scripts/pdf_samples/p40_upper_full_width.png')
res, _ = engine(np.array(upper_strip))

print(f"P40 upper strip width: {w}, height: 500")
x_coords = []
for b, text, s in res:
    m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    if m:
        nums = [int(q) for q, a in m]
        if any(90 <= n <= 130 or 185 <= n <= 215 for n in nums):
            print(f"Found missing targets at x={b[0][0]:.0f}, y={b[0][1]:.0f}: {text}")
        x_coords.append(b[0][0])

print(f"Min X of matches: {min(x_coords) if x_coords else None}, Max X: {max(x_coords) if x_coords else None}")
