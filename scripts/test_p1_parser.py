from PIL import Image
from rapidocr_onnxruntime import RapidOCR
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Import helper
from parse_q_stream_helper import parse_question_stream

engine = RapidOCR()
res, _ = engine(r'c:\ssczone\scripts\pdf_samples\p1_right.png')

# 3 columns
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

for i in range(3):
    cols[i].sort(key=lambda x: x[0])

# Flatten columns in order
all_lines = []
for c in cols:
    all_lines.extend([t for y, t in c])

parsed = parse_question_stream(all_lines)
print(f"Parsed {len(parsed)} questions from p1_right:")
for q in parsed:
    print(f"Q{q['question_number']}: {q['question_text']}")
    print(f"   A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}")
    print(f"   Tag: {q['exam_tag']}")
    print()
