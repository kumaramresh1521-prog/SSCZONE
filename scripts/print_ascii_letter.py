from PIL import Image
import numpy as np

img = Image.open(r"c:\ssczone\public\images\pyq\2026\crop_d.png").convert("L")
arr = np.array(img)
# find bounding box of dark pixels (< 200)
dark = np.where(arr < 200)
if len(dark[0]) > 0:
    min_y, max_y = np.min(dark[0]), np.max(dark[0])
    min_x, max_x = np.min(dark[1]), np.max(dark[1])
    sub = arr[min_y:max_y+1, min_x:max_x+1]
    print(f"Char box: {sub.shape[1]}x{sub.shape[0]}")
    for row in sub:
        line = "".join("#" if val < 180 else " " for val in row)
        print(line)
else:
    print("No dark pixels")
