import sys
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
with pdfplumber.open(pdf_path) as pdf:
    for p_idx in [1, 2]:
        text = pdf.pages[p_idx].extract_text()
        print(f"=== PAGE {p_idx+1} ===")
        print(text)
