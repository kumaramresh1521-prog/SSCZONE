from PIL import Image
import os
import glob

crops = sorted(glob.glob("c:/ssczone/scripts/debug_crop_*.png"))
print(f"Total crops: {len(crops)}")

for c in crops:
    img = Image.open(c)
    # Check width, height
    w, h = img.size
    print(f"{os.path.basename(c)}: {w}x{h}")
