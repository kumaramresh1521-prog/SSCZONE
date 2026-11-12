import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json
import gc

engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')
# Page 40 is index 39
page = doc[39]
pix = page.get_pixmap(dpi=75)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im.size
mid_x = w // 2

# Left page of Page 40 has Type-IV answers from y=170 to h (in 75 dpi scale)
# Let's crop into top part (y: 160 to 450) and bottom part (y: 450 to h)
top_crop = im.crop((0, 160, mid_x, 450))
bot_crop = im.crop((0, 450, mid_x, h))

res_top, _ = engine(np.array(top_crop))
res_bot, _ = engine(np.array(bot_crop))

all_boxes = []
if res_top:
    for b, t, s in res_top:
        all_boxes.append((b, t, s, 'top'))
if res_bot:
    for b, t, s in res_bot:
        all_boxes.append((b, t, s, 'bot'))

answers = {}
for b, t, s, section in all_boxes:
    # If section is bot, skip Type-V (which is on right side of bottom, x > 300 in 75 dpi)
    if section == 'bot' and b[0][0] > 300:
        continue
    
    # Matches like 1. (3), 1, (3), 1.(3), 1-(3)
    matches = re.findall(r'(?:^|[^\d])(\d{1,3})\s*[\.\,\-\)]\s*\(?([1-4])\)?', t)
    for q, a in matches:
        num = int(q)
        if 1 <= num <= 254:
            answers[num] = int(a)

print(f"Type-IV answers extracted: {len(answers)} / 254")
missing = [i for i in range(1, 255) if i not in answers]
print(f"Missing numbers from table: {missing}")

opt_map = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}
letter_map = {q: opt_map.get(a) for q, a in sorted(answers.items())}

with open('type4_answers_table_75dpi.json', 'w', encoding='utf-8') as f:
    json.dump(letter_map, f, indent=2)

print("Saved type4_answers_table_75dpi.json")
