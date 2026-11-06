import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

for pno in [6, 7, 8]: # pages 7, 8, 9 (0-indexed)
    print(f"==================== PAGE {pno+1} ====================")
    print(doc[pno].get_text())
