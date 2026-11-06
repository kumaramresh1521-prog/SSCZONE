import fitz
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

from crop_all_target_questions import results, pdf_dir

for jname, qn, pno, crop_fname, crop_rect in results:
    # Open pdf
    m = re.search(r'2026-(\d+)-([a-z]+)-2026-shift-(\d+)', jname)
    day, month_str, shift = m.group(1), m.group(2), m.group(3)
    month_map = {"october": "Oct", "september": "Sep"}
    month_abbr = month_map.get(month_str, month_str[:3])
    
    target_pdf = None
    for pf in os.listdir(pdf_dir):
        if pf.endswith(".pdf") and f"{day} {month_abbr} 2026 Shift {shift}" in pf:
            target_pdf = pf
            break
            
    doc = fitz.open(os.path.join(pdf_dir, target_pdf))
    p = doc[pno - 1]
    
    text_inside = p.get_text('text', clip=crop_rect)
    imgs_inside = []
    for img in p.get_images(full=True):
        bbox = p.get_image_bbox(img)
        if bbox.intersects(crop_rect):
            imgs_inside.append((img[0], bbox))
            
    drawings_inside = []
    for d in p.get_drawings():
        if d['rect'].intersects(crop_rect):
            drawings_inside.append(d['rect'])
            
    print(f"=== {crop_fname} ===")
    print(f"Text in crop: {repr(text_inside.strip()[:150])}")
    print(f"Images in crop: {len(imgs_inside)} | Drawings in crop: {len(drawings_inside)}")
    if imgs_inside:
        for x, bb in imgs_inside:
            print(f"   Image {x}: {bb}")
    print("-" * 50)
