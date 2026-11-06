import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

img_dir = r"c:\ssczone\public\images\pyq\2026"
files = os.listdir(img_dir)
print(f"Total files in {img_dir}: {len(files)}")

corrupt = []
zero_size = []
valid = 0

for f in files:
    full = os.path.join(img_dir, f)
    sz = os.path.getsize(full)
    if sz == 0:
        zero_size.append(f)
        continue
    try:
        with Image.open(full) as im:
            im.verify()
        valid += 1
    except Exception as e:
        corrupt.append((f, str(e)))

print(f"Valid images: {valid}")
print(f"Zero size images: {len(zero_size)}")
print(f"Corrupt images: {len(corrupt)}")
if corrupt:
    for c in corrupt[:10]:
        print("  Corrupt:", c)
if zero_size:
    for z in zero_size[:10]:
        print("  Zero size:", z)
