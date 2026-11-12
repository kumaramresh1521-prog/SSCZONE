from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
im39 = Image.open('scripts/pdf_samples/spread_39_150.png')
w39, h39 = im39.size
crop39_left = im39.crop((0, 0, w39//2, h39))
crop39_left.save('scripts/pdf_samples/page_39_left_full.png')
res, _ = engine(np.array(crop39_left))

print("All lines on Page 39 left half containing Q numbers 13 to 25:")
found = {}
for b, t, s in res:
    for i in range(13, 26):
        if t.startswith(f'{i}.') or t.startswith(f'{i} .'):
            print(f"Q{i}: '{t}' at x={b[0][0]:.1f}, y={b[0][1]:.1f}")
            found[i] = (b, t)

print(f"\nTotal found: {len(found)} / 13 (Q13 to Q25): {sorted(found.keys())}")

# Save full ocr
with open('scripts/pdf_samples/page_39_left_full_ocr.json', 'w', encoding='utf-8') as f:
    json.dump([[b, t, s] for b, t, s in res], f, ensure_ascii=False, indent=2)
