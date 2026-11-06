import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)

print("=== PAGE 21 ===")
print(doc[20].get_text())

print("=== PAGE 22 ===")
print(doc[21].get_text())
