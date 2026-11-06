import fitz
import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

f_drive = r'F:\startup  send mail\2026'

# Let's map filename to PDF
pdf_map = {
    "ssc-cgl-2026-30-september-2026-shift-2": "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf",
    "ssc-cgl-2026-30-september-2026-shift-3": "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf",
    "ssc-cgl-2026-1-october-2026-shift-1": "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-1-october-2026-shift-2": "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-1-october-2026-shift-3": "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-5-october-2026-shift-1": "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-5-october-2026-shift-2": "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-5-october-2026-shift-3": "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-6-october-2026-shift-1": "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-6-october-2026-shift-2": "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-6-october-2026-shift-3": "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-7-october-2026-shift-1": "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-7-october-2026-shift-2": "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-7-october-2026-shift-3": "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-8-october-2026-shift-1": "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-8-october-2026-shift-2": "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-8-october-2026-shift-3": "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-9-october-2026-shift-1": "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-9-october-2026-shift-2": "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-9-october-2026-shift-3": "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-10-october-2026-shift-1": "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-10-october-2026-shift-2": "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-10-october-2026-shift-3": "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-12-october-2026-shift-1": "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-12-october-2026-shift-2": "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-12-october-2026-shift-3": "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-13-october-2026-shift-1": "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-13-october-2026-shift-2": "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-13-october-2026-shift-3": "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 3).pdf",
}

# Check truncated dashes in PDF
truncated_items = [
    ("ssc-cgl-2026-1-october-2026-shift-3", 36),
    ("ssc-cgl-2026-1-october-2026-shift-3", 54),
    ("ssc-cgl-2026-10-october-2026-shift-1", 3),
    ("ssc-cgl-2026-12-october-2026-shift-1", 39),
    ("ssc-cgl-2026-13-october-2026-shift-3", 56),
    ("ssc-cgl-2026-5-october-2026-shift-1", 73),
    ("ssc-cgl-2026-8-october-2026-shift-2", 60),
    ("ssc-cgl-2026-9-october-2026-shift-3", 40),
]

for base, qn in truncated_items:
    pdf_file = os.path.join(f_drive, pdf_map[base])
    doc = fitz.open(pdf_file)
    print(f"\n==================== {base} Q.{qn} ====================")
    # search pages for question
    for pno, page in enumerate(doc):
        text = page.get_text()
        if f"{qn}." in text or f"{qn:02d}." in text:
            for line in text.split('\n'):
                if any(x in line for x in [f"{qn}.", f"{qn:02d}.", "(A)", "(B)", "(C)", "(D)", "Ans:"]):
                    print(f"  P{pno+1}: {line}")
