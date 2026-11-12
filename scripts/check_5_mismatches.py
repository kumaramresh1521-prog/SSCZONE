import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')

# Check text in questions pages (0 to 7) and explanation pages (8 to 11)
for qn in [37, 96, 97, 101, 102]:
    print(f"==================== Q{qn} ====================")
    # find question text
    for p in range(8):
        t = doc[p].get_text('text')
        pos = t.find(f"{qn}.")
        if pos != -1:
            print(f"[Question on Page {p+1}]:")
            print(t[pos:pos+250])
            break
            
    # find explanation
    for p in range(8, 12):
        t = doc[p].get_text('text')
        pos = t.find(f"{qn}.")
        if pos != -1:
            print(f"[Explanation on Page {p+1}]:")
            print(t[pos:pos+250])
            break
