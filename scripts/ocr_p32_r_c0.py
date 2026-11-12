from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im = Image.open('scripts/pdf_samples/p32_r_c0.png')
res, _ = engine(np.array(im))

print(f"p32_r_c0: {len(res)} boxes")
for b, t, s in res[:25]:
    print(f"  {t}")
