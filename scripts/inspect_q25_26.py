import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

# Look at Page 4 (index 3)
p4_text = doc[3].get_text()
print("--- PAGE 4 TEXT ---")
print(p4_text[p4_text.find("24."):p4_text.find("24.") + 1500])
