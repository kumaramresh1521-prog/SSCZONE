from PIL import Image
import numpy as np

im = Image.open("tmp_math_crops/q72_eq.png").convert('L')
# resize to say 120x35
im_small = im.resize((120, 35))
arr = np.array(im_small)

print("--- ASCII ART OF Q72 EQUATION ---")
for r in arr:
    line = "".join("#" if val < 190 else " " for val in r)
    if "#" in line:
        print(line)
