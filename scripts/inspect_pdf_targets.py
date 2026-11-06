import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

targets = [10, 21, 26, 33, 44, 61, 85, 88]

for pno in range(len(doc)):
    text = doc[pno].get_text()
    for t in targets:
        tag = f"Q{t}."
        if tag in text:
            print(f"\n--- PAGE {pno+1}: {tag} ---")
            lines = text.split("\n")
            # print surrounding lines
            for idx, l in enumerate(lines):
                if tag in l:
                    start = max(0, idx - 1)
                    end = min(len(lines), idx + 25)
                    print("\n".join(lines[start:end]))
                    break
