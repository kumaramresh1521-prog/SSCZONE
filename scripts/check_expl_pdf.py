import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')

# Explanations are on pages 8 to 11 (0-indexed: pages 8, 9, 10, 11)
text = ""
for pno in range(8, 12):
    text += doc[pno].get_text('text')

for qn in [34, 43, 46, 52, 60, 71, 82, 84, 94, 104, 137, 138, 141, 147]:
    pos = text.find(f"{qn}.")
    if pos != -1:
        print(f"=== Q{qn} EXPLANATION IN PDF ===")
        print(text[pos:pos+250])
        print()
