import fitz
import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

missing_files = [
    "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf",
    "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf",
    "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf",
    "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 3).pdf",
    "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf",
    "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf"
]

pdf_dir = r"F:\startup  send mail\2026"

for mfile in missing_files:
    pdf_path = os.path.join(pdf_dir, mfile)
    if not os.path.exists(pdf_path):
        print("Not found:", mfile)
        continue
    doc = fitz.open(pdf_path)
    full_text = ""
    for p in doc:
        full_text += p.get_text() + "\n"
    
    # Search for comprehension or passage or cloze
    matches = re.findall(r'(Comprehension[^\n]{0,50}|Passage[^\n]{0,50}|Cloze[^\n]{0,50})', full_text, re.I)
    print(f"File: {mfile}")
    print(f"  Matches: {matches[:5]}")
    # Also check what is around Q.75-Q.80 and Q.95-Q.100
    for q_match in re.finditer(r'\b(75|76|95|96)\.\s+', full_text):
        idx = q_match.start()
        print(f"  Near {q_match.group(0)}: {repr(full_text[max(0, idx-50):min(len(full_text), idx+100)])}")
    print("-" * 60)
