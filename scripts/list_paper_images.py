import os
import glob
import re

img_dir = r"c:\ssczone\public\images\pyq\2026"
all_imgs = sorted(os.listdir(img_dir))
print(f"Total images in {img_dir}: {len(all_imgs)}")

# Check images for 1-oct-shift-3, 10-oct-shift-3, 12-oct-shift-3, 5-oct-shift-3, 8-oct-shift-3
for key in ["1-october-2026-shift-3", "10-october-2026-shift-3", "12-october-2026-shift-3", "5-october-2026-shift-3", "8-october-2026-shift-3"]:
    matching = [img for img in all_imgs if key in img]
    print(f"=== Images for {key}: {len(matching)} ===")
    for m in matching:
        print("  ", m)
