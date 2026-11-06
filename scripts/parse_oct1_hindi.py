import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
doc = fitz.open(pdf_path)

text = ""
for page in doc:
    text += page.get_text() + "\n"

# Match questions starting with "01.", "02.", etc.
pattern = re.compile(r'(\d{2})\.\s+(.*?)(?=\n\s*\(A\)|\n\s*\(B\))', re.DOTALL)
matches = pattern.findall(text)
print(f"Extracted {len(matches)} questions from PDF!")

for num, qtext in matches[:10]:
    clean_q = ' '.join(qtext.strip().split())
    print(f"Q.{int(num)}: {clean_q}")
