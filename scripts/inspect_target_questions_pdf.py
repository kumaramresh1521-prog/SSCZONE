import fitz
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"F:\startup  send mail\2026"

month_map = {
    "january": "Jan", "february": "Feb", "march": "Mar", "april": "Apr",
    "may": "May", "june": "Jun", "july": "Jul", "august": "Aug",
    "september": "Sep", "october": "Oct", "november": "Nov", "december": "Dec"
}

# The 21 questions we identified
target_questions = [
    ("ssc-cgl-2026-1-october-2026-shift-3.json", 24),
    ("ssc-cgl-2026-10-october-2026-shift-3.json", 9),
    ("ssc-cgl-2026-10-october-2026-shift-3.json", 15),
    ("ssc-cgl-2026-12-october-2026-shift-3.json", 11),
    ("ssc-cgl-2026-12-october-2026-shift-3.json", 14),
    ("ssc-cgl-2026-13-october-2026-shift-2.json", 13),
    ("ssc-cgl-2026-13-october-2026-shift-3.json", 15),
    ("ssc-cgl-2026-30-september-2026-shift-3.json", 5),
    ("ssc-cgl-2026-5-october-2026-shift-3.json", 54),
    ("ssc-cgl-2026-6-october-2026-shift-3.json", 6),
    ("ssc-cgl-2026-6-october-2026-shift-3.json", 9),
    ("ssc-cgl-2026-6-october-2026-shift-3.json", 17),
    ("ssc-cgl-2026-7-october-2026-shift-3.json", 20),
    ("ssc-cgl-2026-8-october-2026-shift-3.json", 11),
    ("ssc-cgl-2026-8-october-2026-shift-3.json", 12),
    ("ssc-cgl-2026-8-october-2026-shift-3.json", 19),
    ("ssc-cgl-2026-8-october-2026-shift-3.json", 71),
    ("ssc-cgl-2026-9-october-2026-shift-1.json", 6),
    ("ssc-cgl-2026-9-october-2026-shift-1.json", 7),
    ("ssc-cgl-2026-9-october-2026-shift-3.json", 16),
    ("ssc-cgl-2026-9-october-2026-shift-3.json", 21)
]

pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]

for jname, qn in target_questions:
    # Match PDF
    m = re.search(r'2026-(\d+)-([a-z]+)-2026-shift-(\d+)', jname)
    if not m:
        continue
    day, month_str, shift = m.group(1), m.group(2), m.group(3)
    month_abbr = month_map.get(month_str, month_str[:3])
    
    target_pdf = None
    for pf in pdf_files:
        if f"{day} {month_abbr} 2026 Shift {shift}" in pf or f"{day} {month_str} 2026 Shift {shift}" in pf:
            target_pdf = pf
            break
            
    if not target_pdf:
        print(f"Could not match PDF for {jname}")
        continue
        
    doc = fitz.open(os.path.join(pdf_dir, target_pdf))
    # Find page with Q.{qn}
    for pno in range(len(doc)):
        txt = doc[pno].get_text()
        if re.search(rf'\b{qn}\.\s+', txt):
            # Check what images exist on this page
            p = doc[pno]
            imgs = p.get_images(full=True)
            # Find rect for this question
            q_rects = p.search_for(f"{qn}.")
            next_q_rects = p.search_for(f"{qn+1}.")
            
            print(f"=== {jname} | Q.{qn} ===")
            print(f"PDF: {target_pdf} | Page {pno+1}")
            print(f"Question rect: {q_rects}")
            print(f"Images on page: {len(imgs)}")
            for img in imgs:
                bbox = p.get_image_bbox(img)
                # Check if this image is vertically between this question and next question or on same column
                if q_rects and bbox:
                    qy0 = q_rects[0].y0
                    qy1 = next_q_rects[0].y0 if next_q_rects else p.rect.height
                    print(f"   Image xref {img[0]}: bbox={bbox} (qy0={qy0:.1f}, qy1={qy1:.1f})")
            break
    print("-" * 60)
