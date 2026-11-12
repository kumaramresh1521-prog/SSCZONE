from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

for p in ['answers_spread_p39.png', 'answers_spread_p40.png']:
    im = Image.open(f'scripts/pdf_samples/{p}')
    w, h = im.size
    print(f"\n=================== {p} ({w}x{h}) ===================")
    # Check left half and right half
    for half_name, box in [('LEFT', (0, 0, w//2, h)), ('RIGHT', (w//2, 0, w, h))]:
        sub = im.crop(box)
        res, _ = engine(np.array(sub))
        if not res: continue
        print(f"--- {half_name} HALF ---")
        headers = [text for b, text, s in res if 'TYPE' in text.upper() or 'ANSWERS' in text.upper()]
        print("  Headers:", headers)
        
        # Look for question ranges
        all_txt = " ".join([text for b, text, s in res])
        matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', all_txt)
        if matches:
            nums = [int(q) for q, a in matches]
            print(f"  Matches: count={len(matches)}, min={min(nums)}, max={max(nums)}")
