import fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

f_drive = r'F:\startup  send mail\2026'

check_samples = [
    ("SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf", 2),
    ("SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf", 57),
    ("SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf", 51),
    ("SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf", 40),
    ("SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf", 40),
]

for pdf_name, qn in check_samples:
    pdf_path = os.path.join(f_drive, pdf_name)
    doc = fitz.open(pdf_path)
    print(f"\n==================== {pdf_name} Q.{qn} ====================")
    for pno, page in enumerate(doc):
        text = page.get_text()
        if f"{qn}." in text or f"{qn:02d}." in text:
            lines = text.split('\n')
            for i, l in enumerate(lines):
                if l.strip().startswith(f"{qn}.") or l.strip().startswith(f"{qn:02d}."):
                    print(f"Page {pno+1}:")
                    for j in range(max(0, i), min(len(lines), i+15)):
                        print(f"   {lines[j]}")
                    break
