from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im = Image.open('scripts/pdf_samples/page_28_r.png')
# Crop top 300 pixels
crop_top = im.crop((0, 0, im.width, 350))
res, _ = engine(np.array(crop_top))

print("=== TOP 350 PIXELS OF PAGE 28 RIGHT HALF ===")
for b, t, s in res:
    print(f"y={b[0][1]:.0f}, x={b[0][0]:.0f}: {t}")
