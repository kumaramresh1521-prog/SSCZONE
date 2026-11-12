from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json

engine = RapidOCR()

im = Image.open('scripts/pdf_samples/type3_ans_p40.png')
w, h = im.size

with open('type3_answers_complete.json', 'r') as f:
    answers = json.load(f)
answers = {int(k): int(v) for k, v in answers.items()}

# Slice into 8 vertical strips with overlap
num_strips = 8
strip_w = w / num_strips
overlap = 30

for idx in range(num_strips):
    x0 = max(0, int(idx * strip_w - overlap))
    x1 = min(w, int((idx + 1) * strip_w + overlap))
    sub = im.crop((x0, 0, x1, h))
    res, _ = engine(np.array(sub))
    if not res:
        continue
    for b, text, s in res:
        m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
        for q, a in m:
            num = int(q)
            if 37 <= num <= 257:
                answers[num] = int(a)

print(f"Total answers now: {len(answers)} / 257")
missing = [i for i in range(1, 258) if i not in answers]
print(f"Missing count: {len(missing)}")
if missing:
    print(f"Missing numbers: {missing}")

with open('type3_answers_complete.json', 'w') as f:
    json.dump(answers, f, indent=2)
