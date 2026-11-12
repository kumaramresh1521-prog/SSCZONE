from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
engine = RapidOCR()

im39 = Image.open('scripts/pdf_samples/answers_spread_p39.png')
w, h = im39.size
# On p39 right half: Type-II was at the top. Where did Type-III start?
right = im39.crop((w//2, 0, w, h))
res, _ = engine(np.array(right))

for b, text, s in sorted(res, key=lambda it: (it[0][0][1], it[0][0][0])):
    if 'TYPE' in text.upper():
        print(f"Header: {text} at y={b[0][1]:.0f}, x={b[0][0]:.0f}")
    m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    if m:
        nums = [int(q) for q, a in m]
        if min(nums) <= 10 and b[0][1] > 600:
            print(f"Early Qs at y={b[0][1]:.0f}: {m}")
