import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)

print(f"Total pages in doc: {len(doc)}")

# Look for TYPE-II in questions section (pages 1 to 38)
for pno in range(5, 25):
    page = doc[pno]
    txt = page.get_text() or ''
    if 'TYPE-II' in txt.upper() or 'TYPE -II' in txt.upper() or 'TYPE - II' in txt.upper() or 'NUMBER ANALOGY' in txt.upper():
        print(f"Questions: Page {pno+1} mentions TYPE-II")

# Look for TYPE-III (where Type-II questions end)
for pno in range(15, 30):
    page = doc[pno]
    txt = page.get_text() or ''
    if 'TYPE-III' in txt.upper() or 'TYPE -III' in txt.upper() or 'TYPE - III' in txt.upper():
        print(f"Questions: Page {pno+1} mentions TYPE-III (Type-II end)")

# Look for TYPE-II in Answer Key (around pages 36 to 41)
for pno in range(35, 42):
    page = doc[pno]
    txt = page.get_text() or ''
    if 'ANSWERS' in txt.upper() or 'TYPE-II' in txt.upper():
        print(f"Answers: Page {pno+1} check")

# Look for TYPE-II in Explanations (around pages 42 to 55)
for pno in range(42, 55):
    page = doc[pno]
    txt = page.get_text() or ''
    if 'TYPE-II' in txt.upper() or 'TYPE -II' in txt.upper():
        print(f"Explanations: Page {pno+1} mentions TYPE-II")
    if 'TYPE-III' in txt.upper() or 'TYPE -III' in txt.upper():
        print(f"Explanations: Page {pno+1} mentions TYPE-III (Type-II expl end)")
