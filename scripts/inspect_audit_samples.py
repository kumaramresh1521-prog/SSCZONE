import fitz
import re
import sys
import os

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

# Inspect 30 Sep Shift 3 Q.13 and Q.23
pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)

for p_idx in range(len(doc)):
    page = doc[p_idx]
    txt = page.get_text()
    if "13." in txt and ("Ans:" in txt or "(A)" in txt):
        for b in page.get_text("blocks"):
            if any(term in b[4] for term in ["13.", "(A)", "Ans:"]):
                print(f"P.{p_idx+1} Block ({b[0]:.1f}, {b[1]:.1f}):\n{repr(b[4])}")
