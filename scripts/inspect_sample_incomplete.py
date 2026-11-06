import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)

# Let's search for Q.5, Q.13, Q.17
for p_idx in range(len(doc)):
    page = doc[p_idx]
    txt = page.get_text()
    for qn in [5, 13, 17]:
        m = re.search(r"(?:^|\n)\s*0?" + str(qn) + r"\.\s*([\s\S]*?)(?=(?:^|\n)\s*0?" + str(qn+1) + r"\.|\Z)", txt)
        if m:
            print(f"=== PAGE {p_idx+1} - Q.{qn} ===")
            print(m.group(0)[:300])
            print("Images on this page:", len(page.get_images()))
