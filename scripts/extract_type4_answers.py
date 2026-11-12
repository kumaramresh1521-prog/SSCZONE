from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json

engine = RapidOCR()
img = Image.open('scripts/pdf_samples/page_40.png')
w, h = img.size

# Type-IV answers are in the middle band: y between 350 and 850
# Let's crop with some margin
crop_t4 = img.crop((0, int(h * 0.15), w, int(h * 0.55)))
res, _ = engine(np.array(crop_t4))

items = []
for b, text, s in res:
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    items.extend(matches)

# Map into question number -> digit answer
t4_answers = {}
for q, a in items:
    qn = int(q)
    # Check if reasonable
    if 1 <= qn <= 300:
        t4_answers[qn] = int(a)

print(f"Extracted {len(t4_answers)} unique answers for Type-IV:")
nums = sorted(list(t4_answers.keys()))
print(f"Min Q: {min(nums)}, Max Q: {max(nums)}")
print(f"First 10: {[(n, t4_answers[n]) for n in nums[:10]]}")
print(f"Last 10: {[(n, t4_answers[n]) for n in nums[-10:]]}")

# Save
with open('type4_answers_raw.json', 'w', encoding='utf-8') as f:
    json.dump(t4_answers, f, indent=2)
