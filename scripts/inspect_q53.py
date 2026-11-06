import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

page = doc[15] # Page 16
blocks = page.get_text("dict")["blocks"]

print("--- SPANS BETWEEN 280 and 420 ---")
for b in blocks:
    if "lines" in b:
        for line in b["lines"]:
            for span in line["spans"]:
                y = span["bbox"][1]
                if 280 <= y <= 430:
                    print(f"y={y:.1f}, x={span['bbox'][0]:.1f}, font={span['font']}, text='{span['text']}'")
