from rapidocr_onnxruntime import RapidOCR
import re
import json

engine = RapidOCR()
res, _ = engine(r'c:\ssczone\scripts\pdf_samples\expl_pages\p40_right.png')

# Sort text blocks into 3 columns by x-midpoint
# Page width is ~877
cols = [[], [], []]
for box, text, score in res:
    x_mid = (box[0][0] + box[1][0]) / 2.0
    y_top = box[0][1]
    if x_mid < 290:
        cols[0].append((y_top, text))
    elif x_mid < 585:
        cols[1].append((y_top, text))
    else:
        cols[2].append((y_top, text))

# Sort each column by y_top
for i in range(3):
    cols[i].sort(key=lambda x: x[0])

# Join text column by column
full_text = "\n".join([" ".join([item[1] for item in col]) for col in cols])

# Find headers: ^(\d{1,3})\s*[\.\)]\s*\(([1-4])\)
# or inline
headers = list(re.finditer(r'(?:^|\n|\s)(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', full_text))
print(f"Found {len(headers)} explanation headers in p40_right:")
for h in headers[:10]:
    print(f"  Q{h.group(1)} -> Ans {h.group(2)}")

expls = {}
for i in range(len(headers)):
    q_num = int(headers[i].group(1))
    start_pos = headers[i].end()
    end_pos = headers[i+1].start() if i + 1 < len(headers) else len(full_text)
    txt = full_text[start_pos:end_pos].strip()
    expls[q_num] = txt

print(f"Extracted {len(expls)} explanations.")
for qn in [1, 2, 3, 4, 13, 14, 27, 28]:
    if qn in expls:
        print(f"Q{qn}: {expls[qn][:80]}...")
