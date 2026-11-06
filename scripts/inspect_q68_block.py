import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

def extract_page_blocks(page):
    blocks = page.get_text("blocks")
    valid_blocks = [b for b in blocks if b[4].strip()]
    left = sorted([b for b in valid_blocks if (b[0]+b[2])/2 < 305], key=lambda b: (round(b[1]/4.0), b[0]))
    right = sorted([b for b in valid_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: (round(b[1]/4.0), b[0]))
    return "\n".join(b[4] for b in left + right)

full_text = ""
for p in range(1, len(doc)):
    full_text += "\n" + extract_page_blocks(doc[p])

m = re.search(r"(?:^|\n)\s*68\.\s*([\s\S]*?)(?=(?:^|\n)\s*69\.)", full_text)
if m:
    print("Q.68 BLOCK:")
    print(m.group(1))
