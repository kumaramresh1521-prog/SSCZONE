import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

for p_num in [3, 4]:
    text = doc[p_num].get_text()
    idx26 = text.find("26.")
    if idx26 != -1:
        print(f"Page {p_num+1} contains 26.:")
        print(text[idx26:idx26 + 400])
