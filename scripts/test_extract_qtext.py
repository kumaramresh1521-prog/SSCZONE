import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

print(f"Opened PDF: {pdf_path}")
print(f"Total pages: {len(doc)}")

# Let's extract full text with page numbers
all_text = []
for pno, page in enumerate(doc):
    text = page.get_text()
    all_text.append((pno + 1, text))

# For questions 4, 13, 15, 16, 19, 20, 23
test_qns = [4, 13, 15, 16, 19, 20, 23]

for qn in test_qns:
    print(f"\n==================== SEARCHING FOR Q.{qn} ====================")
    found = False
    for pno, text in all_text:
        # Search for pattern like "\n4.\n" or "\n4. " or starts with "4."
        pattern = rf'(?:^|\n)\s*{qn}\.\s*(.*?)(?=\n\s*\([A-D]\)|\n\s*Ans:|\n\s*{qn+1}\.|\Z)'
        match = re.search(pattern, text, re.DOTALL)
        if match:
            found = True
            raw_qt = match.group(1).strip()
            # Clean up line breaks
            lines = [l.strip() for l in raw_qt.split('\n') if l.strip()]
            clean_qt = " ".join(lines)
            print(f"Page {pno}:")
            print(f"  Raw: {raw_qt}")
            print(f"  Clean: {clean_qt}")
            break
    if not found:
        print(f"  NOT FOUND with regex! Checking raw lines:")
        for pno, text in all_text:
            if f"{qn}." in text:
                print(f"  Page {pno} has '{qn}.'")
                for l in text.split('\n'):
                    if any(x in l for x in [f"{qn}.", f"{qn} ."]):
                        print(f"    Line: {l}")
