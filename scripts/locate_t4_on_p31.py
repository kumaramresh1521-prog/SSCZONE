from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im31 = Image.open('scripts/pdf_samples/page_31.png')
w, h = im31.size

# Check where TYPE-IV appears
res, _ = engine(np.array(im31))
for b, t, s in res:
    if 'TYPE-IV' in t or 'TYPE -IV' in t or 'TYPE' in t:
        print(f"Found '{t}' at bbox: {b}")
