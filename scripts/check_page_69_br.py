from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
im69 = Image.open('scripts/pdf_samples/page_69_full.png')
w69, h69 = im69.size

# Bottom right quadrant
crop_br = im69.crop((w69//2, int(h69 * 0.7), w69, h69))
crop_br.save('scripts/pdf_samples/page_69_br.png')
res, _ = engine(np.array(crop_br))

print("=== BOTTOM RIGHT OF PAGE 69 ===")
for b, t, s in res:
    print(f"y={b[0][1]:.0f}, x={b[0][0]:.0f}: {t}")
