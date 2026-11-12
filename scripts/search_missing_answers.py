from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re

engine = RapidOCR()

for pno, path in [(39, 'scripts/pdf_samples/answer_table_p39_200dpi.png'), (40, 'scripts/pdf_samples/answer_table_p40_200dpi.png')]:
    im = Image.open(path)
    w, h = im.size
    print(f"\nScanning Page {pno} ({w}x{h})...")
    # Scan in 4 horizontal quadrants
    for q_idx in range(4):
        y0 = int(q_idx * h / 4)
        y1 = int((q_idx + 1) * h / 4)
        sub = im.crop((0, y0, w, y1))
        res, _ = engine(np.array(sub))
        if not res: continue
        for b, text, s in res:
            m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
            for q, a in m:
                num = int(q)
                if num in [95, 100, 105, 110, 115, 120, 195, 200, 205, 210]:
                    print(f"  P{pno} Q{q_idx+1} at x={b[0][0]:.0f}, y={y0+b[0][1]:.0f}: {text}")
