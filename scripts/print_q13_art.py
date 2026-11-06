from PIL import Image
import numpy as np

img = Image.open(r"c:\ssczone\public\images\pyq\2026\q13_p3_right.png").convert("L")
arr = np.array(img)[::2, ::2]
print("--- P3 RIGHT ---")
for row in arr:
    line = "".join("#" if val < 180 else " " for val in row)
    if line.strip():
        print(line)

img4 = Image.open(r"c:\ssczone\public\images\pyq\2026\q13_p4_top.png").convert("L")
arr4 = np.array(img4)[::2, ::2]
print("\n--- P4 TOP ---")
for row in arr4:
    line = "".join("#" if val < 180 else " " for val in row)
    if line.strip():
        print(line)
