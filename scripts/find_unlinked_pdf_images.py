import fitz
import json
import os
import re
import sys
import glob

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
pdf_dir = r"F:\startup  send mail\2026"

month_map = {
    "january": "Jan", "february": "Feb", "march": "Mar", "april": "Apr",
    "may": "May", "june": "Jun", "july": "Jul", "august": "Aug",
    "september": "Sep", "october": "Oct", "november": "Nov", "december": "Dec"
}

files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))
pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]

unlinked_images_found = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    m = re.search(r'2026-(\d+)-([a-z]+)-2026-shift-(\d+)', fname)
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
        continue
        
    doc = fitz.open(os.path.join(pdf_dir, target_pdf))
    
    # For each page, get question blocks and images
    for pno in range(len(doc)):
        p = doc[pno]
        imgs = p.get_images(full=True)
        # Filter out header/footer images (y < 60 or y > 780, or full-width branding)
        content_imgs = []
        for img in imgs:
            bbox = p.get_image_bbox(img)
            if bbox and bbox.y0 >= 60 and bbox.y1 <= 780:
                # Also exclude small logos if any
                if bbox.width > 20 and bbox.height > 20:
                    content_imgs.append((img[0], bbox))
                    
        if not content_imgs:
            continue
            
        # Find which questions appear on this page
        txt = p.get_text()
        q_nums_on_page = [int(n) for n in re.findall(r'(?:^|\n)\s*(\d{1,3})\.\s+', txt)]
        q_nums_on_page = [n for n in q_nums_on_page if 1 <= n <= 100]
        
        # Check each image against questions on this page
        for x, bbox in content_imgs:
            # Which question's vertical range contains or is closest above this bbox in the same column?
            # Column: left (< 300) or right (>= 300)
            img_col_left = bbox.x0 < 300
            
            best_q = None
            best_dist = 9999
            
            for qn in q_nums_on_page:
                q_rects = p.search_for(f"{qn}.")
                for qr in q_rects:
                    qr_col_left = qr.x0 < 300
                    if qr_col_left == img_col_left:
                        # Image should be below or at question text
                        if bbox.y0 >= qr.y0 - 20:
                            dist = bbox.y0 - qr.y0
                            if dist < best_dist:
                                best_dist = dist
                                best_q = qn
                                
            if best_q:
                # Check if this best_q currently has any image linked
                target_q = questions[best_q - 1]
                has_any_img = any("![" in val for val in [target_q.get("question_text",""), target_q.get("option_a",""), target_q.get("option_b",""), target_q.get("option_c",""), target_q.get("option_d","")])
                if not has_any_img:
                    unlinked_images_found.append({
                        "file": fname,
                        "qn": best_q,
                        "pdf": target_pdf,
                        "page": pno + 1,
                        "xref": x,
                        "bbox": bbox,
                        "q_text": target_q.get("question_text","")[:80]
                    })

print(f"Total unlinked content images found in PDFs: {len(unlinked_images_found)}")
for item in unlinked_images_found:
    print(f"{item['file']} | Q.{item['qn']} (Page {item['page']}, xref {item['xref']})")
    print(f"   BBox: {item['bbox']}")
    print(f"   Text: {repr(item['q_text'])}")
    print()
