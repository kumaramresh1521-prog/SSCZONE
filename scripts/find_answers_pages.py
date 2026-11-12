import pypdf
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
reader = pypdf.PdfReader('F:/startup  send mail/pdf/analogy question 2-70.pdf')

for idx, page in enumerate(reader.pages):
    txt = page.extract_text() or ''
    if 'TYPE-I' in txt and ('ANSWER' in txt or 'EXPLANATION' in txt):
        print(f"Page {idx+1}: contains TYPE-I and ANSWER/EXPLANATION")
    if 'TYPE-II' in txt and ('ANSWER' in txt or 'EXPLANATION' in txt):
        print(f"Page {idx+1}: contains TYPE-II and ANSWER/EXPLANATION")
