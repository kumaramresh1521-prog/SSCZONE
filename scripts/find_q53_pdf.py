import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\SSC CGL, 2025 Official Paper (Held On_ 16 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)

for page_idx, page in enumerate(doc):
    txt = page.get_text()
    if "Evaluate" in txt or "ज्ञात कीजिए" in txt:
        print(f"=== Found on Page {page_idx+1} ===")
        print(txt[:1500])
