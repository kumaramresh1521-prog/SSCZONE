from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

engine = RapidOCR()

# Load answers_spread_p39.png and answers_spread_p40.png
# Let's crop the answer table regions
im39 = Image.open(r'c:\ssczone\scripts\pdf_samples\answers_spread_p39.png')
im40 = Image.open(r'c:\ssczone\scripts\pdf_samples\answers_spread_p40.png')

# In im39, the answer table is on the right side
# In im40, the answer table is on the left side (0 to w//2)
w40, h40 = im40.size
table40_crop = im40.crop((0, 0, w40 // 2, h40))
table40_crop.save(r'c:\ssczone\scripts\pdf_samples\type2_answers_p40_crop.png')

res40, _ = engine(np.array(table40_crop))
print(f"Detected {len(res40)} blocks in table 40 crop.")

# Let's inspect where TYPE-II answers start in im39 and im40
type2_answers = {}

# In table 40:
for box, txt, score in res40:
    # Find all patterns like "1. (2)" or "35. (4)" or "105. (3)" or "296. (4)"
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', txt)
    for q_str, ans_str in matches:
        q_num = int(q_str)
        ans_num = int(ans_str)
        if 1 <= q_num <= 350:
            type2_answers[q_num] = ans_num

print(f"Extracted {len(type2_answers)} answers from p40 crop.")
print(f"Min Q: {min(type2_answers.keys()) if type2_answers else None}, Max Q: {max(type2_answers.keys()) if type2_answers else None}")

with open('type2_answers_raw.json', 'w', encoding='utf-8') as f:
    json.dump(type2_answers, f, indent=2)
