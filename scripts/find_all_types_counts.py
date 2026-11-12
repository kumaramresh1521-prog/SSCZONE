from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

for pno in [38, 39]: # p39 and p40
    im = Image.open(f'scripts/pdf_samples/page_{pno+1}.png')
    res, _ = engine(np.array(im))
    print(f"\n================ PAGE {pno+1} ================")
    sorted_res = sorted(res, key=lambda it: (it[0][0][1], it[0][0][0]))
    for box, text, score in sorted_res:
        if any(w in text.upper() for w in ['TYPE', 'ANSWERS', 'उत्तर']):
            print(f"HEADER: '{text}' at y={box[0][1]:.1f}, x={box[0][0]:.1f}")
        nums = [int(m) for m in re.findall(r'\b(\d{1,3})\s*[\.\)]\s*\(?[1-4]\)?', text)]
        if nums and max(nums) > 50:
            print(f"   Max num in line: {max(nums)} (sample: {text[:30]})")
