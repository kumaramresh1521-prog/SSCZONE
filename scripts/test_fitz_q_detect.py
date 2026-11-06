import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

full_text = ""
for page_num in range(1, len(doc)): # skip cover page 0
    full_text += "\n" + doc[page_num].get_text()

# Check question numbering pattern
# In the text, questions start with: 01., 02., ... 10., 11., ... 100.
# Or sometimes on newline: \n01.\n or \n01. Text
print("Total text length:", len(full_text))

# Let's inspect where questions are found
found_q = []
for q_num in range(1, 101):
    patterns = [
        rf"(?:^|\n)\s*{q_num:02d}\.\s*",
        rf"(?:^|\n)\s*{q_num}\.\s*"
    ]
    matched = False
    for p in patterns:
        m = list(re.finditer(p, full_text))
        if m:
            matched = True
            found_q.append((q_num, m[0].start()))
            break
    if not matched:
        print(f"Missing Q.{q_num}")

print(f"Total question markers found: {len(found_q)} / 100")
