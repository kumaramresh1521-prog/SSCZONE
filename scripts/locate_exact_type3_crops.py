from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re

engine = RapidOCR()

im39 = Image.open('scripts/pdf_samples/answer_table_p39_200dpi.png')
w39, h39 = im39.size
# On p39, answer table is right half (w39//2 to w39)
crop39 = im39.crop((w39//2, int(h39*0.65), w39, h39))
res39, _ = engine(np.array(crop39))

print("=== P39 Lower Right ===")
for b, text, s in res39:
    if 'TYPE' in text.upper() or any(k in text for k in ['1.', '2.', '35.', '36.']):
        print(f"  {text} at y={b[0][1]}, x={b[0][0]}")

im40 = Image.open('scripts/pdf_samples/answer_table_p40_200dpi.png')
w40, h40 = im40.size
# On p40, answer table is left half (0 to w40//2), top section (0 to h40*0.35)
crop40 = im40.crop((0, 0, w40//2, int(h40*0.35)))
res40, _ = engine(np.array(crop40))

print("\n=== P40 Upper Left ===")
for b, text, s in res40:
    if 'TYPE' in text.upper() or any(k in text for k in ['37.', '38.', '256.', '257.']):
        print(f"  {text} at y={b[0][1]}, x={b[0][0]}")
