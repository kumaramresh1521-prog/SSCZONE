from PIL import Image
import numpy as np

im = Image.open("tmp_math_crops/q69_angle.png").convert('L')
# resize to say 40x25
im_small = im.resize((40, 25))
arr = np.array(im_small)

print("--- ASCII ART OF Q69 ANGLE ---")
for r in arr:
    line = "".join("#" if val < 180 else " " for val in r)
    if "#" in line:
        print(line)
