import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
doc = fitz.open(pdf_path)
print("Page count:", len(doc))
for i in [1, 4, 6, 8]:
    print(f"--- PAGE {i+1} ---")
    print(doc[i].get_text()[:400].replace('\n', ' '))
