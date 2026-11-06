import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)
page20 = doc[19]

d = page20.get_text("dict")
for b in d["blocks"]:
    if "lines" in b:
        for l in b["lines"]:
            for s in l["spans"]:
                if 230 <= s["bbox"][1] <= 320:
                    print(f"Span: {repr(s['text'])} font: {s['font']} bbox: {[round(x, 1) for x in s['bbox']]}")
