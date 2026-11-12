import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')

text = doc[10].get_text('text') # page 11 (0-indexed 10)
for line in text.split('\n'):
    if any(line.strip().startswith(f"{n}.") for n in range(96, 106)):
        print("MATCH:", line)
print("\n--- Full text around 101-105 ---")
pos = text.find("101.")
if pos != -1:
    print(text[pos-100:pos+400])
