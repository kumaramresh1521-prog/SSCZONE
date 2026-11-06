import sys
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
with pdfplumber.open(pdf_path) as pdf:
    for idx, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        headers = [l for l in lines if any(h in l.upper() for h in ["GENERAL", "QUANTITATIVE", "ENGLISH", "AWARENESS", "INTELLIGENCE", "COMPREHENSION"])]
        print(f"Page {idx+1}: {len(lines)} lines | Headers: {headers[:3]}")
