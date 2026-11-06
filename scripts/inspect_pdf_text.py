import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")
for page_num in range(min(5, len(doc))):
    page = doc[page_num]
    text = page.get_text()
    print(f"\n=================== PAGE {page_num + 1} ===================")
    print(text[:1500])
