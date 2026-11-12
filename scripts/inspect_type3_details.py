import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

engine = RapidOCR()

# Check answer table on p39 and p40
print("--- Checking Answer Table on p39 & p40 ---", flush=True)
for pno in [38, 39]: # 0-indexed: 39 and 40
    im_path = f"scripts/pdf_samples/page_{pno+1}.png"
    im = Image.open(im_path)
    res, _ = engine(np.array(im))
    if res:
        for box, text, score in res:
            if 'TYPE' in text.upper() or 'ANSWERS' in text.upper():
                print(f"Page {pno+1}: {text} at y={box[0][1]:.1f}", flush=True)

print("Done answer table check.", flush=True)
