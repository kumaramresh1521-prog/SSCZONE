import fitz
import re
import sys
import os

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

targets = [
    (r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 2).pdf", "ssc-cgl-2026-8-october-2026-shift-2", 6),
    (r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf", "ssc-cgl-2026-10-october-2026-shift-2", 7),
    (r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf", "ssc-cgl-2026-10-october-2026-shift-3", 13),
]

for pdf_path, slug, qn in targets:
    doc = fitz.open(pdf_path)
    for p_idx in range(1, len(doc)):
        page = doc[p_idx]
        txt = page.get_text()
        if re.search(r"(?:^|\n)\s*0?" + str(qn) + r"\.", txt):
            print(f"\n--- {os.path.basename(pdf_path)} Q.{qn} (Page {p_idx+1}) ---")
            words = page.get_text("words")
            # find q_start
            q_w = [w for w in words if re.match(r"^0?" + str(qn) + r"\.$", w[4])]
            if q_w:
                w0 = q_w[0]
                col = 0 if (w0[0]+w0[2])/2 < 305 else 1
                col_w = [w for w in words if (0 if (w[0]+w[2])/2 < 305 else 1) == col and w[1] >= w0[1] - 5]
                # print first 20 words
                print("Words:", [w[4] for w in col_w[:25]])
