import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\SSC CGL, 2025 Official Paper (Held On_ 16 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)

print(f"Total pages in 16 Sept 2025 Shift 1: {len(doc)}")
for i in range(min(4, len(doc))):
    print(f"\n--- PAGE {i+1} ---")
    print(doc[i].get_text()[:1500])
