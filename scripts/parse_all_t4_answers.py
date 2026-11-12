from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json

engine = RapidOCR()
img = Image.open('scripts/pdf_samples/answers_spread_p40.png')
w, h = img.size
mid_x = w // 2 # 877

# Crop left page from y=340 to 1241
crop_all_t4 = img.crop((0, 340, mid_x, h))
crop_all_t4.save('scripts/pdf_samples/page_40_all_t4.png')

res, _ = engine(np.array(crop_all_t4))

# Collect all tokens
answers = {}
for b, text, s in res:
    # Notice: Type-V is in bottom right (x > 600, y > 840 - 340 = 500) with Q numbers 1-25.
    # So if y > 500 and x > 600, skip (that's Type-V)
    bx = b[0][0]
    by = b[0][1]
    if by > 490 and bx > 600:
        continue # skip Type-V answers
    
    # Match various patterns: "1. (3)", "1, (3)", "1.(3)", "1- (3)", "1 (3)"
    m = re.findall(r'(?:^|[^\d])(\d{1,3})\s*[\.\,\-\)]\s*\(?([1-4])\)?', text)
    for q, a in m:
        num = int(q)
        if 1 <= num <= 254:
            answers[num] = int(a)

print(f"Extracted {len(answers)} / 254 Type-IV answers from Page 40 left page!")
missing = [i for i in range(1, 255) if i not in answers]
print(f"Missing numbers: {missing}")

# Save
opt_map = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}
letter_answers = {q: opt_map.get(a, '') for q, a in sorted(answers.items())}
with open('type4_answers_table.json', 'w', encoding='utf-8') as f:
    json.dump(letter_answers, f, indent=2)
