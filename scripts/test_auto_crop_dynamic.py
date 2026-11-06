import fitz
import re
import os
import sys

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
slug = "ssc-cgl-2026-30-september-2026-shift-3"
img_dir = r"c:\ssczone\public\images\pyq\2026"

def crop_question_options(doc, target_qn):
    # Find page and words
    for p_idx in range(1, len(doc)):
        page = doc[p_idx]
        words = page.get_text("words")
        # Find target_qn start
        q_start = None
        for w in words:
            if re.match(r"^0?" + str(target_qn) + r"\.$", w[4]):
                q_start = w
                break
        if not q_start:
            continue
            
        col = 0 if (q_start[0]+q_start[2])/2 < 305 else 1
        x_min = 60 if col == 0 else 300
        x_max = 298 if col == 0 else 535
        
        # Find Option markers on this column
        # Look for (A), (B), (C), (D) and Ans:
        col_words = [w for w in words if x_min <= (w[0]+w[2])/2 <= x_max and w[1] >= q_start[1] - 5]
        
        opt_words = {}
        ans_word = None
        for w in col_words:
            m = re.match(r"^\(([A-D])\)$", w[4])
            if m:
                let = m.group(1)
                if let not in opt_words:
                    opt_words[let] = w
            elif w[4] == "Ans:":
                ans_word = w
                break
                
        print(f"Q.{target_qn} on P.{p_idx+1}: opt_words found: {list(opt_words.keys())}, ans={bool(ans_word)}")
        if len(opt_words) >= 4 and ans_word:
            # We can determine the bounding boxes for A, B, C, D
            # Let's see: are A and B side by side or stacked?
            a_w = opt_words['A']
            b_w = opt_words['B']
            c_w = opt_words['C']
            d_w = opt_words['D']
            
            # Check if side-by-side (abs(a_w[1] - b_w[1]) < 8)
            side_by_side = abs(a_w[1] - b_w[1]) < 8
            
            rects = {}
            if side_by_side:
                # Row 1: A and B
                mid_x = (x_min + x_max) / 2
                y0_row1 = a_w[1] - 4
                y1_row1 = c_w[1] - 4
                y0_row2 = c_w[1] - 4
                y1_row2 = ans_word[1] - 4
                
                rects['A'] = fitz.Rect(a_w[2] + 2, y0_row1, mid_x, y1_row1)
                rects['B'] = fitz.Rect(b_w[2] + 2, y0_row1, x_max, y1_row1)
                rects['C'] = fitz.Rect(c_w[2] + 2, y0_row2, mid_x, y1_row2)
                rects['D'] = fitz.Rect(d_w[2] + 2, y0_row2, x_max, y1_row2)
            else:
                # Vertical stacking: A, then B, then C, then D
                rects['A'] = fitz.Rect(a_w[2] + 2, a_w[1] - 4, x_max, b_w[1] - 4)
                rects['B'] = fitz.Rect(b_w[2] + 2, b_w[1] - 4, x_max, c_w[1] - 4)
                rects['C'] = fitz.Rect(c_w[2] + 2, c_w[1] - 4, x_max, d_w[1] - 4)
                rects['D'] = fitz.Rect(d_w[2] + 2, d_w[1] - 4, x_max, ans_word[1] - 4)
                
            res_urls = {}
            for let, r in rects.items():
                pix = page.get_pixmap(clip=r, dpi=150)
                out_name = f"{slug}_q{target_qn}_opt_{let}.png"
                out_path = os.path.join(img_dir, out_name)
                pix.save(out_path)
                res_urls[let] = f"/images/pyq/2026/{out_name}"
                print(f"  Saved Option {let}: {r} -> {out_name} ({pix.width}x{pix.height})")
            return res_urls

print("Testing Q.13:")
crop_question_options(doc, 13)

print("\nTesting Q.23:")
crop_question_options(doc, 23)
