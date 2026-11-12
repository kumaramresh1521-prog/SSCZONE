from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

answers = {}

# 1. Parse answers from answers_spread_p39.png (right half, bottom y >= 870)
print("Parsing Type-III answers from Page 39...", flush=True)
im39 = Image.open('scripts/pdf_samples/answers_spread_p39.png')
w39, h39 = im39.size
# Crop right half of p39 from y=850 to end
crop39 = im39.crop((w39 // 2, 850, w39, h39))
res39, _ = engine(np.array(crop39))

for b, text, s in res39:
    # Match patterns like "1. (3)" or "2. (4)" or "1.(3)"
    m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q, a in m:
        num = int(q)
        if 1 <= num <= 50:
            answers[num] = int(a)

print(f"Parsed {len(answers)} answers from Page 39 (Range 1-50): {sorted(list(answers.keys()))}", flush=True)

# 2. Parse answers from answers_spread_p40.png (left half, top y < 353)
print("Parsing Type-III answers from Page 40...", flush=True)
im40 = Image.open('scripts/pdf_samples/answers_spread_p40.png')
w40, h40 = im40.size
crop40 = im40.crop((0, 0, w40 // 2, 355))
res40, _ = engine(np.array(crop40))

for b, text, s in res40:
    m = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q, a in m:
        num = int(q)
        if 1 <= num <= 260:
            answers[num] = int(a)

print(f"Total Type-III answers parsed: {len(answers)} / 257", flush=True)
missing = [i for i in range(1, 258) if i not in answers]
print(f"Missing answer numbers: {missing}", flush=True)

opt_map = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}
letter_answers = {q: opt_map.get(a, '') for q, a in sorted(answers.items())}

with open('type3_answers_raw.json', 'w', encoding='utf-8') as f:
    json.dump(letter_answers, f, indent=2)

print("Saved type3_answers_raw.json successfully!", flush=True)
