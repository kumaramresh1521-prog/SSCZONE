import fitz
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

f_drive = r"F:\startup  send mail\2026"

pdf_map = {
    "ssc-cgl-2026-1-october-2026-shift-2": "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-10-october-2026-shift-2": "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-13-october-2026-shift-2": "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-13-october-2026-shift-3": "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-30-september-2026-shift-2": "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf",
    "ssc-cgl-2026-5-october-2026-shift-1": "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-6-october-2026-shift-3": "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-7-october-2026-shift-1": "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 1).pdf",
    "ssc-cgl-2026-9-october-2026-shift-3": "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 3).pdf",
}

targets = [
    ("ssc-cgl-2026-1-october-2026-shift-2", 57),
    ("ssc-cgl-2026-10-october-2026-shift-2", 54),
    ("ssc-cgl-2026-10-october-2026-shift-2", 63),
    ("ssc-cgl-2026-13-october-2026-shift-2", 53),
    ("ssc-cgl-2026-13-october-2026-shift-3", 56),
    ("ssc-cgl-2026-30-september-2026-shift-2", 53),
    ("ssc-cgl-2026-5-october-2026-shift-1", 73),
    ("ssc-cgl-2026-6-october-2026-shift-3", 57),
    ("ssc-cgl-2026-7-october-2026-shift-1", 75),
    ("ssc-cgl-2026-9-october-2026-shift-3", 40),
    ("ssc-cgl-2026-9-october-2026-shift-3", 61),
]

for base, qn in targets:
    print(f"\n==================== {base} Q.{qn} ====================")
    pdf_path = os.path.join(f_drive, pdf_map[base])
    doc = fitz.open(pdf_path)
    for pno, page in enumerate(doc):
        t = page.get_text()
        lines = t.split('\n')
        for i, l in enumerate(lines):
            if l.strip().startswith(f"{qn}.") or l.strip().startswith(f"{qn:02d}."):
                print(f"PDF Page {pno+1}:")
                for j in range(max(0, i), min(len(lines), i+18)):
                    print("   " + lines[j].strip())
                break
