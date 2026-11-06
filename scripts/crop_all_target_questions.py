import fitz
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"F:\startup  send mail\2026"
crop_out_dir = r"c:\ssczone\public\images\pyq\2026"
os.makedirs(crop_out_dir, exist_ok=True)

month_map = {
    "january": "Jan", "february": "Feb", "march": "Mar", "april": "Apr",
    "may": "May", "june": "Jun", "july": "Jul", "august": "Aug",
    "september": "Sep", "october": "Oct", "november": "Nov", "december": "Dec"
}

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

results = []

for jname, qn in target_questions:
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
    for pno in range(len(doc)):
        p = doc[pno]
        txt = p.get_text()
        if re.search(rf'\b{qn}\.\s+', txt):
            # Find bounds
            q_rects = p.search_for(f"{qn}.")
            next_q_rects = p.search_for(f"{qn+1}.")
            ans_rects = p.search_for(f"Ans:")
            
            if q_rects:
                qr = q_rects[0]
                # Determine column: left column (x < 300) or right column (x >= 300)
                col_left = 65 if qr.x0 < 300 else 300
                col_right = 295 if qr.x0 < 300 else 535
                
                # Top is just below question text line
                top_y = qr.y1
                
                # Bottom is either next question top, or column bottom, or Ans: for this question
                bot_y = p.rect.height - 60
                if next_q_rects:
                    for nqr in next_q_rects:
                        if (qr.x0 < 300 and nqr.x0 < 300) or (qr.x0 >= 300 and nqr.x0 >= 300):
                            if nqr.y0 > qr.y0:
                                bot_y = min(bot_y, nqr.y0)
                                break
                                
                # Save crop of the entire question block
                crop_rect = fitz.Rect(col_left, qr.y0 - 5, col_right, bot_y)
                pix = p.get_pixmap(clip=crop_rect, dpi=200)
                crop_fname = f"debug_crop_{jname.replace('.json', '')}_q{qn}.png"
                crop_path = os.path.join("c:/ssczone/scripts", crop_fname)
                pix.save(crop_path)
                results.append((jname, qn, pno+1, crop_fname, crop_rect))
                print(f"Cropped {jname} Q.{qn} (Page {pno+1}) -> {crop_fname} (Rect: {crop_rect})")
            break

print(f"\nTotal cropped: {len(results)}")
