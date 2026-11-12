from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im39 = Image.open('scripts/pdf_samples/spread_39_150.png')
w, h = im39.size
# Right half top
crop_rt = im39.crop((w//2, 0, w, 400))
res, _ = engine(np.array(crop_rt))

print("=== SPREAD 39 RIGHT HALF TOP ===")
for b, t, s in res:
    print(f"y={b[0][1]:.0f}, x={b[0][0]:.0f}: {t}")
