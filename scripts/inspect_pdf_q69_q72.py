import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

for i in range(len(doc)):
    page = doc[i]
    text = page.get_text()
    if "central angle" in text or "radius of 10" in text:
        print(f"\n=======================================================")
        print(f"Page {i+1} (Q69 area):")
        print(text)
    if "Given" in text and ("what is" in text or "मान क्या होगा" in text):
        print(f"\n=======================================================")
        print(f"Page {i+1} (Q72 area):")
        print(text)
