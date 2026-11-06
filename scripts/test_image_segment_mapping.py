import fitz
import re
import sys
import os

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)

out_dir = r"c:\ssczone\public\images\pyq\2026"
os.makedirs(out_dir, exist_ok=True)
slug = "ssc-cgl-2026-30-september-2026-shift-3"

# Find question boundaries per page
# We scan each page for "0?(\d{1,3})\." and "Ans:"
q_segments = [] # list of (q_num, p_idx, col, y0, y1)

for p_idx in range(1, len(doc)):
    page = doc[p_idx]
    words = page.get_text("words")
    # sort by col then y
    words = [w for w in words if w[1] > 55 and w[3] < 785]
    
    # We want to identify start and end y for each question or answer on this page
    q_starts = []
    for w in words:
        m = re.match(r"^0?([1-9]\d?|100)\.$", w[4])
        if m:
            q_num = int(m.group(1))
            col = 0 if (w[0]+w[2])/2 < 305 else 1
            q_starts.append((q_num, col, w[1]))
            
    # Also find Ans points
    ans_points = []
    for w in words:
        if w[4] == "Ans:":
            col = 0 if (w[0]+w[2])/2 < 305 else 1
            ans_points.append((col, w[3]))

    # Now define segments on this page
    # A column starts at y=60, ends at y=780
    for col in [0, 1]:
        col_qs = [q for q in q_starts if q[1] == col]
        col_qs.sort(key=lambda item: item[2])
        for idx_q, q in enumerate(col_qs):
            q_num = q[0]
            y0 = q[2]
            # y1 is either the start of the next question in this column, or bottom of column (780)
            if idx_q + 1 < len(col_qs):
                y1 = col_qs[idx_q + 1][2]
            else:
                y1 = 780.0
            q_segments.append((q_num, p_idx, col, y0, y1))

print(f"Total question segments defined: {len(q_segments)}")

# Now map images
image_mapping = {} # q_num -> list of images
for p_idx in range(1, len(doc)):
    page = doc[p_idx]
    images = page.get_images()
    for img in images:
        xref = img[0]
        rects = page.get_image_rects(xref)
        for r in rects:
            if r.y0 > 55 and r.y1 < 780 and (r.x1 - r.x0) > 30 and (r.y1 - r.y0) > 30:
                if (r.x1 - r.x0) > 400 and (r.y1 - r.y0) > 400:
                    continue # watermark
                base = doc.extract_image(xref)
                ext = base["ext"]
                img_name = f"{slug}_p{p_idx+1}_x{xref}.{ext}"
                img_path = os.path.join(out_dir, img_name)
                if not os.path.exists(img_path):
                    with open(img_path, "wb") as f:
                        f.write(base["image"])
                        
                col = 0 if (r.x0 + r.x1)/2 < 305 else 1
                mid_y = (r.y0 + r.y1)/2
                
                # Match to segment
                matched_q = None
                for seg in q_segments:
                    s_q, s_p, s_col, s_y0, s_y1 = seg
                    if s_p == p_idx and s_col == col and (s_y0 - 20) <= mid_y <= (s_y1 + 10):
                        matched_q = s_q
                        break
                        
                if matched_q is not None:
                    if matched_q not in image_mapping:
                        image_mapping[matched_q] = []
                    image_mapping[matched_q].append({
                        "xref": xref,
                        "rect": r,
                        "w": r.x1 - r.x0,
                        "h": r.y1 - r.y0,
                        "url": f"/images/pyq/2026/{img_name}"
                    })

print(f"\nQuestions with mapped images: {len(image_mapping)}")
for q_num in sorted(image_mapping.keys()):
    imgs = image_mapping[q_num]
    print(f"Q.{q_num}: {len(imgs)} images -> {[im['url'].split('/')[-1] for im in imgs]}")
