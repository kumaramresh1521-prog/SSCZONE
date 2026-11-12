from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re

engine = RapidOCR()
img = Image.open('scripts/pdf_samples/page_40.png')
w, h = img.size

# Let's crop the answers tables on page 40:
# Region 1: y from 0 to 450 (Top half)
# Region 2: y from 400 to 1000 (Bottom half)

top_crop = img.crop((0, 0, w, int(h * 0.5)))
res_top, _ = engine(np.array(top_crop))

print("=== TOP HALF OF PAGE 40 (Answer Key) ===")
for box, text, s in res_top:
    if any(k in text.upper() for k in ['TYPE', 'ANSWER', '1.', '2.', '3.']) or len(text) < 15:
        print(f"y={box[0][1]:.1f}, x={box[0][0]:.1f}: '{text}'")

bot_crop = img.crop((0, int(h * 0.45), w, h))
res_bot, _ = engine(np.array(bot_crop))

print("\n=== BOTTOM HALF OF PAGE 40 (Answer Key) ===")
for box, text, s in res_bot:
    if any(k in text.upper() for k in ['TYPE', 'ANSWER', '1.', '2.', '3.']) or len(text) < 15:
        print(f"y={box[0][1]:.1f}, x={box[0][0]:.1f}: '{text}'")
