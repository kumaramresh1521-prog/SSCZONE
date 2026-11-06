import os
from PIL import Image

img_dir = r"c:\ssczone\public\images\pyq\2026"

xrefs = [336, 337, 338, 339, 340, 341]
for x in xrefs:
    fname = f"ssc-cgl-2026-8-october-2026-shift-3_p3_x{x}.jpeg"
    fpath = os.path.join(img_dir, fname)
    if os.path.exists(fpath):
        im = Image.open(fpath)
        print(f"Found {fname}: size {im.size}")
    else:
        print(f"NOT found {fname}")
