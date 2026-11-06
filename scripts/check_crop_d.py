from PIL import Image
import numpy as np

img = Image.open(r"c:\ssczone\public\images\pyq\2026\test_q6_options.png")
print("Size:", img.size)
# Let's crop the area right of (D)
# rect was (320, 320, 520, 360), dpi 150 -> scale is 150/72 = 2.0833
# (D) is at x=430-444, y=339-350
# in pixels: x0 = (444 - 320) * 150 / 72 = 258
# x1 = (480 - 320) * 150 / 72 = 333
# y0 = (338 - 320) * 150 / 72 = 37
# y1 = (352 - 320) * 150 / 72 = 66
crop_d = img.crop((250, 35, 330, 70))
crop_d.save(r"c:\ssczone\public\images\pyq\2026\crop_d.png")
arr = np.array(crop_d)
print("Non-white pixels in crop_d:", np.sum(arr < 240))
