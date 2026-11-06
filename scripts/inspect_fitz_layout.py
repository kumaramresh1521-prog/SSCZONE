import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
print("Page count:", len(doc))

for p_num in range(min(3, len(doc))):
    page = doc[p_num]
    text = page.get_text()
    print(f"--- PAGE {p_num+1} ({len(text)} chars) ---")
    print(text[:1200])
