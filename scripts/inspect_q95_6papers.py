import fitz
import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

missing_files = [
    ("ssc-cgl-2026-10-october-2026-shift-3.json", "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf"),
    ("ssc-cgl-2026-12-october-2026-shift-3.json", "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf"),
    ("ssc-cgl-2026-13-october-2026-shift-2.json", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf"),
    ("ssc-cgl-2026-13-october-2026-shift-3.json", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 3).pdf"),
    ("ssc-cgl-2026-30-september-2026-shift-3.json", "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"),
    ("ssc-cgl-2026-6-october-2026-shift-3.json", "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf")
]

pdf_dir = r"F:\startup  send mail\2026"

for jname, pname in missing_files:
    pdf_path = os.path.join(pdf_dir, pname)
    doc = fitz.open(pdf_path)
    full_text = ""
    for p in doc:
        full_text += p.get_text() + "\n"
        
    print(f"=== {pname} ===")
    m95 = re.search(r'95\.\s+.*?(?=96\.)', full_text, re.S)
    if m95:
        print(m95.group(0).strip())
    else:
        print("95 not matched cleanly")
    print("=" * 60)
