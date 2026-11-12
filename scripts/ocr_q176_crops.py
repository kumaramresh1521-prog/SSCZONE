from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
for fname in ['q176_crop_150.png', 'ans176_crop_150.png']:
    im = Image.open('scripts/pdf_samples/' + fname)
    res, _ = engine(np.array(im))
    print(f"=== {fname} ===")
    for b, t, s in res or []:
        print(f"  {t}")
