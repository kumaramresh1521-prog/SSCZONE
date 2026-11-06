import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

print(f"Total pages in 1 Oct 2026 Shift 2: {len(doc)}")
for i in range(min(3, len(doc))):
    print(f"\n--- PAGE {i+1} ---")
    print(doc[i].get_text()[:1500])
