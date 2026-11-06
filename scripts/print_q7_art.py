from PIL import Image
import numpy as np

img = Image.open(r"c:\ssczone\public\images\pyq\2026\q7_options_rendered.png").convert("L")
arr = np.array(img)
# Downsample by 2 for readable terminal output
down = arr[::2, ::2]
for row in down:
    print("".join("#" if val < 180 else " " for val in row))
