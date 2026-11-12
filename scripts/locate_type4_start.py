import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')

for pno in [27, 28, 29]: # 0-indexed: Pages 28, 29, 30
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    w, h = im.size
    
    # Save image
    im.save(f'scripts/pdf_samples/page_{pno+1}.png')
    
    # Scan for TYPE-IV
    res, _ = engine(np.array(im))
    print(f"\n--- PDF Page {pno+1} ---")
    for b, t, s in (res or []):
        if 'TYPE' in t.upper() or 'TYPE-IV' in t.upper() or 'LETTER' in t.upper() or t.startswith('1.') or t.startswith('257.'):
            print(f"  {t} at x={b[0][0]:.0f}, y={b[0][1]:.0f}")
