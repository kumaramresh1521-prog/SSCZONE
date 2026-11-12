from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im = Image.open('scripts/pdf_samples/p36_col0_crop.png')
res, _ = engine(np.array(im))

print("=== OCR of p36_col0_crop ===")
for b, t, s in res:
    print(f"  {t}")
