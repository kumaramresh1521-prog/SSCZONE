import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# Open 2025 paper 16 Sept 2025 Shift 1
pdf_path = r"F:\startup  send mail\SSC CGL, 2025 Official Paper (Held On_ 16 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)

# Extract first 10 questions from PDF
full_text = ""
for page in doc:
    full_text += page.get_text() + "\n"

# Look at how questions are structured
q_blocks = re.split(r'\n(?=Q\d+\.)', full_text)
print(f"Total question blocks found: {len(q_blocks)}")

for b in q_blocks[1:6]:
    print("\n----------------- QUESTION BLOCK -----------------")
    print(b[:400])
