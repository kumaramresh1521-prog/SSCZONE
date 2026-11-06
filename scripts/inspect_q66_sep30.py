import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)

for p_idx in range(len(doc)):
    text = doc[p_idx].get_text()
    if "66." in text:
        print(f"--- PAGE {p_idx+1} ---")
        lines = text.split("\n")
        for i, l in enumerate(lines):
            if "66." in l:
                print("\n".join(lines[max(0, i-5):min(len(lines), i+15)]))
                break
