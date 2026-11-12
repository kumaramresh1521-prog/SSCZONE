from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im = Image.open('scripts/pdf_samples/q167_crop_150.png')
res, _ = engine(np.array(im))

print("=== OCR of Q167 ===")
for b, t, s in res:
    print(f"  {t}")
