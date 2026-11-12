from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

print("=== EXTRACTING TYPE-V QUESTIONS (1 to 25) ===")

# 1. Page 38 right half (Q1 to Q12)
im38 = Image.open('scripts/pdf_samples/page_38_full.png')
w38, h38 = im38.size
crop38_r = im38.crop((w38//2, 80, w38, h38))
crop38_r.save('scripts/pdf_samples/t5_q1_12.png')
res38, _ = engine(np.array(crop38_r))

# 2. Page 39 left half top (Q13 to Q25)
im39 = Image.open('scripts/pdf_samples/spread_39_150.png')
w39, h39 = im39.size
crop39_lt = im39.crop((0, 50, w39//2, 510))
crop39_lt.save('scripts/pdf_samples/t5_q13_25.png')
res39, _ = engine(np.array(crop39_lt))

# 3. Page 69 right half (Explanations 1 to 25)
im69 = Image.open('scripts/pdf_samples/page_69_full.png')
w69, h69 = im69.size
crop69_r = im69.crop((w69//2, 100, w69, h69))
crop69_r.save('scripts/pdf_samples/t5_expl.png')
res69, _ = engine(np.array(crop69_r))

with open('scripts/pdf_samples/t5_q1_12_ocr.json', 'w', encoding='utf-8') as f:
    json.dump([[b, t, s] for b, t, s in res38], f, ensure_ascii=False, indent=2)

with open('scripts/pdf_samples/t5_q13_25_ocr.json', 'w', encoding='utf-8') as f:
    json.dump([[b, t, s] for b, t, s in res39], f, ensure_ascii=False, indent=2)

with open('scripts/pdf_samples/t5_expl_ocr.json', 'w', encoding='utf-8') as f:
    json.dump([[b, t, s] for b, t, s in res69], f, ensure_ascii=False, indent=2)

print("OCR complete for all Type-V questions and explanations!")
