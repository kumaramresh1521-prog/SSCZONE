import fitz
from PIL import Image
import numpy as np

# Let's inspect q69_crop.png and q72_crop.png
im69 = Image.open("tmp_math_crops/q69_crop.png")
im72 = Image.open("tmp_math_crops/q72_crop.png")
print("im69 size:", im69.size)
print("im72 size:", im72.size)

# Let's check non-white pixels in the crop
arr72 = np.array(im72.convert('L'))
# find rows with dark pixels
dark_rows = np.where(arr72 < 200)[0]
print(f"im72 has dark pixels on rows: min {dark_rows.min()}, max {dark_rows.max()}")

# Let's crop just the equation area in q72:
# x is roughly 110 to 280 (scaled by 200/72 = 2.77)
# bbox in 72 dpi was x: 110-280, y: 240-275
# relative to rect(50, 200, 550, 350)
scale = 200 / 72
x0 = int((110 - 50) * scale)
x1 = int((290 - 50) * scale)
y0 = int((235 - 200) * scale)
y1 = int((275 - 200) * scale)

crop_eq = im72.crop((x0, y0, x1, y1))
crop_eq.save("tmp_math_crops/q72_eq.png")
print(f"Saved tmp_math_crops/q72_eq.png (size: {crop_eq.size})")

# Let's also crop the angle in q69:
# bbox in 72 dpi was x: 380-410, y: 550-575
# relative to rect(50, 500, 550, 650)
x0_69 = int((380 - 50) * scale)
x1_69 = int((410 - 50) * scale)
y0_69 = int((545 - 500) * scale)
y1_69 = int((575 - 500) * scale)
crop_69 = im69.crop((x0_69, y0_69, x1_69, y1_69))
crop_69.save("tmp_math_crops/q69_angle.png")
print(f"Saved tmp_math_crops/q69_angle.png (size: {crop_69.size})")
