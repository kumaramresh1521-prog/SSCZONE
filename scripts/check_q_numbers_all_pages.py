import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

for p_num in range(1, len(doc)):
    page_text = doc[p_num].get_text()
    q_matches = re.findall(r"(?:^|\n)\s*(\d{1,3})\.\s*", page_text)
    print(f"Page {p_num+1}: Q numbers found: {q_matches[:8]}")
