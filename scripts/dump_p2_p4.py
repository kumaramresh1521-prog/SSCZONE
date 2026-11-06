import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

print("=== PAGE 2 ===")
print(doc[1].get_text())

print("=== PAGE 4 ===")
print(doc[3].get_text())
