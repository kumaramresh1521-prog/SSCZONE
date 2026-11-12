from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im28 = Image.open('scripts/pdf_samples/page_28.png')
w, h = im28.size

# Crop right half of page 28
crop_r = im28.crop((w//2, 0, w, h))
crop_r.save('scripts/pdf_samples/page_28_r.png')
res, _ = engine(np.array(crop_r))

print("=== PAGE 28 RIGHT HALF ===")
for b, t, s in res:
    if 'TYPE' in t.upper() or t.startswith('1.') or t.startswith('2.') or t.startswith('3.') or 'LETTER' in t.upper() or 'DIRECT' in t.upper():
        print(f"y={b[0][1]:.0f}, x={b[0][0]:.0f}: {t}")
