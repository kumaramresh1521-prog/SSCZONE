import sys
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i in range(min(3, len(pdf.pages))):
        text = pdf.pages[i].extract_text()
        print(f"--- PAGE {i+1} ---")
        print(text[:500] if text else "No text extracted")
