import sys
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
with pdfplumber.open(pdf_path) as pdf:
    print(f"Num pages: {len(pdf.pages)}")
    text_p1 = pdf.pages[0].extract_text()
    print("PAGE 1 TEXT:", text_p1)
    text_p2 = pdf.pages[1].extract_text()
    print("PAGE 2 FIRST 500 CHARS:\n", text_p2[:500] if text_p2 else "Empty")
