from PIL import Image
import os
from rapidocr_onnxruntime import RapidOCR
import re
import json

# Open highres page 39
img = Image.open(r'c:\ssczone\scripts\pdf_samples\page_39_highres.png')

# The TYPE-I answer table is located on the right side of the spread, around x: 860 to 1450, y: 620 to 1560
# Let's crop slightly larger: x: 850 to 1500, y: 620 to 1580
crop_box = (850, 620, 1500, 1580)
cropped = img.crop(crop_box)
cropped.save(r'c:\ssczone\scripts\pdf_samples\type1_answers_crop.png')
print("Cropped answer table saved, size:", cropped.size)

engine = RapidOCR()
result, _ = engine(r'c:\ssczone\scripts\pdf_samples\type1_answers_crop.png')

print(f"Detected {len(result)} items in cropped answer table.")

# Collect all patterns like: <num>. (<digit>) or <num>. (<digit>)
answers = {}
raw_items = []
for box, text, score in result:
    raw_items.append((box, text))
    # match patterns like "1. (2)" or "15. (3)" or "105. (4)"
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q_num, ans in matches:
        answers[int(q_num)] = int(ans)

print(f"Parsed {len(answers)} answers out of 284.")
missing = [i for i in range(1, 285) if i not in answers]
print(f"Missing numbers: {missing}")

# Save what we found
with open('type1_answers_raw.json', 'w') as f:
    json.dump(answers, f, indent=2)
