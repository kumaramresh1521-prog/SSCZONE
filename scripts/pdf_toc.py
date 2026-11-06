import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")
for i, page in enumerate(doc):
    text = page.get_text()
    print(f"=== PAGE {i+1} ===")
    lines = text.split('\n')
    for line in lines:
        if any(line.strip().startswith(f"{q}.") for q in range(1, 101)):
            print("  ", line.strip())
