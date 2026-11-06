import fitz
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

folder = r"F:\startup  send mail"
pdf_files = [f for f in sorted(os.listdir(folder)) if f.lower().endswith(".pdf")]

print(f"Found {len(pdf_files)} PDF files in {folder}:")

for fname in pdf_files:
    pdf_path = os.path.join(folder, fname)
    doc = fitz.open(pdf_path)
    
    # find start page
    start_pno = 0
    for pno in range(min(5, len(doc))):
        txt = doc[pno].get_text()
        if "Q1." in txt or "General Intelligence" in txt:
            start_pno = pno
            break
            
    content_blocks = []
    for pno in range(start_pno, len(doc)):
        page = doc[pno]
        blocks = page.get_text("blocks")
        for b in blocks:
            text = b[4].strip()
            y0, y1 = b[1], b[3]
            if y0 < 45 or y1 > 800:
                continue
            if "testbook" in text.lower():
                continue
            if re.match(r'^Q\d+\.\s*$', text):
                continue
            content_blocks.append(text)

    full_text = "\n".join(content_blocks)
    ca_pattern = re.compile(r'Correct Answer:\s*([A-D])', re.IGNORECASE)
    parts = ca_pattern.split(full_text)
    
    total_q = (len(parts) - 1) // 2
    print(f"  • {fname:62s} | Pages: {len(doc):2d} | Start Page: {start_pno+1:2d} | Extracted Qs: {total_q}")
