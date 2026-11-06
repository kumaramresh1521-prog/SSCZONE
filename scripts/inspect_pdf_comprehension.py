import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf")
print("Total pages in PDF:", len(doc))

for pno in range(len(doc)):
    text = doc[pno].get_text()
    if "Comprehension" in text or "Obesity" in text:
        print(f"--- Page {pno+1} ---")
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for l in lines[:40]:
            print("  ", l)
