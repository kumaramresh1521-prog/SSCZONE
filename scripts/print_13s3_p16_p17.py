import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

print("=== PAGE 16 ===")
print(doc[15].get_text())

print("=== PAGE 17 ===")
print(doc[16].get_text()[:600])
