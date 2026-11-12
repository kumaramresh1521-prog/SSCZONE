from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im = Image.open('scripts/pdf_samples/q69_crop_150.png')
res, _ = engine(np.array(im))

print("=== OCR of Q69 ===")
for b, t, s in res:
    print(f"  {t}")
