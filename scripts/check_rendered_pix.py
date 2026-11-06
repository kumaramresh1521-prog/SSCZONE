from PIL import Image
import numpy as np

img = Image.open(r"c:\ssczone\public\images\pyq\2026\test_q13_rendered.png")
print("Size:", img.size)
arr = np.array(img)
print("Color channels:", arr.shape)
# Check non-white pixels
non_white = np.sum(arr < 240)
print("Non-white pixel count:", non_white)
