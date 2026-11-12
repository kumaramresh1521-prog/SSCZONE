from PIL import Image
from rapidocr_onnxruntime import RapidOCR
import re

def cluster_and_sort(items, y_tolerance=10):
    # Sort by y center
    items = sorted(items, key=lambda it: (it[0][0][1] + it[0][2][1]) / 2.0)
    lines = []
    current_line = []
    current_y = None
    
    for it in items:
        y_mid = (it[0][0][1] + it[0][2][1]) / 2.0
        if current_y is None or abs(y_mid - current_y) <= y_tolerance:
            current_line.append(it)
            current_y = y_mid if current_y is None else (current_y + y_mid) / 2.0
        else:
            # Sort current line by x left
            current_line.sort(key=lambda it: it[0][0][0])
            lines.append(" ".join([it[1] for it in current_line]))
            current_line = [it]
            current_y = y_mid
            
    if current_line:
        current_line.sort(key=lambda it: it[0][0][0])
        lines.append(" ".join([it[1] for it in current_line]))
        
    return lines

engine = RapidOCR()
res, _ = engine(r'c:\ssczone\scripts\pdf_samples\p1_right.png')

# Filter out non-question header boxes like "ANALOGY OR SIMILARITY" at the very top (y < 40)
filtered_res = [it for it in res if it[0][0][1] > 40 and 'ANALOGY' not in it[1] and '@apna' not in it[1]]

# 3 columns
cols = [[], [], []]
for it in filtered_res:
    x_mid = (it[0][0][0] + it[0][1][0]) / 2.0
    if x_mid < 290:
        cols[0].append(it)
    elif x_mid < 585:
        cols[1].append(it)
    else:
        cols[2].append(it)

col0_lines = cluster_and_sort(cols[0])
print("=== CLUSTERED COL 0 ===")
for l in col0_lines[:25]:
    print(l)
