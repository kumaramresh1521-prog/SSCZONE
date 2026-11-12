import pdfplumber
import sys

sys.stdout.reconfigure(encoding='utf-8')

with pdfplumber.open('F:/startup  send mail/pdf/analogy question 2-70.pdf') as pdf:
    for p in range(36, 42):
        txt = pdf.pages[p].extract_text() or ''
        lines = [l.strip() for l in txt.split('\n') if l.strip()]
        print(f"=== Page {p+1} ({len(lines)} lines) ===")
        print("First 5 lines:", lines[:5])
        print("Last 5 lines:", lines[-5:])
