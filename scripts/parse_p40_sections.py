from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
engine = RapidOCR()

im40 = Image.open('scripts/pdf_samples/answers_spread_p40.png')
w, h = im40.size
left = im40.crop((0, 0, w//2, h))
res, _ = engine(np.array(left))

sec1 = [] # y < 353 (TYPE-III?)
sec2 = [] # 353 <= y < 843 (TYPE-IV)
sec3 = [] # y >= 843 (TYPE-V)

for b, text, s in res:
    y = b[0][1]
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    if not matches:
        continue
    if y < 353:
        sec1.extend(matches)
    elif y < 843:
        sec2.extend(matches)
    else:
        sec3.extend(matches)

def summarize(name, m_list):
    nums = sorted(list(set(int(q) for q, a in m_list)))
    print(f"\n=== {name} ===")
    print(f"Total entries: {len(m_list)}, Unique Qs: {len(nums)}")
    if nums:
        print(f"Min Q: {min(nums)}, Max Q: {max(nums)}")
        print(f"First 5: {m_list[:5]}")
        print(f"Last 5: {m_list[-5:]}")

summarize("Section 1 (y < 353) - TYPE-III", sec1)
summarize("Section 2 (353 <= y < 843) - TYPE-IV", sec2)
summarize("Section 3 (y >= 843) - TYPE-V", sec3)
