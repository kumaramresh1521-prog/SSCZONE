import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

# Search for Q51, Q53, Q56, Q57 etc.
for pno in range(len(doc)):
    text = doc[pno].get_text()
    for q_target in ["Q51.", "Q52.", "Q53.", "Q56.", "Q57.", "Q68.", "Q71.", "Q75."]:
        if q_target in text:
            print(f"\n================ PAGE {pno+1} : {q_target} ================")
            print(text[:1500])
