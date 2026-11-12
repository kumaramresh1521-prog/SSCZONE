from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re

engine = RapidOCR()

for p in [39, 40]:
    img_path = f'scripts/pdf_samples/page_{p}.png'
    img = Image.open(img_path)
    res, _ = engine(np.array(img))
    print(f"\n================ PAGE {p} HEADERS & STRUCTURE ================")
    for box, text, s in res:
        t_up = text.upper()
        if any(k in t_up for k in ['TYPE', 'ANSWER', 'EXPLANATION']):
            print(f"y={box[0][1]:.1f}, x={box[0][0]:.1f}: '{text}'")
