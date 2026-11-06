import fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

f_drive = r'F:\startup  send mail\2026'

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

sample_fraction_items = [
    ("ssc-cgl-2026-1-october-2026-shift-2", 47),
    ("ssc-cgl-2026-10-october-2026-shift-2", 61),
    ("ssc-cgl-2026-10-october-2026-shift-2", 62),
    ("ssc-cgl-2026-10-october-2026-shift-2", 63),
    ("ssc-cgl-2026-10-october-2026-shift-3", 68),
    ("ssc-cgl-2026-12-october-2026-shift-2", 65),
    ("ssc-cgl-2026-13-october-2026-shift-2", 62),
    ("ssc-cgl-2026-30-september-2026-shift-2", 68),
    ("ssc-cgl-2026-30-september-2026-shift-3", 56),
    ("ssc-cgl-2026-5-october-2026-shift-1", 9),
    ("ssc-cgl-2026-5-october-2026-shift-2", 66),
    ("ssc-cgl-2026-6-october-2026-shift-2", 57),
    ("ssc-cgl-2026-6-october-2026-shift-2", 66),
    ("ssc-cgl-2026-6-october-2026-shift-2", 74),
    ("ssc-cgl-2026-6-october-2026-shift-3", 62),
    ("ssc-cgl-2026-7-october-2026-shift-1", 69),
    ("ssc-cgl-2026-8-october-2026-shift-1", 48),
    ("ssc-cgl-2026-8-october-2026-shift-2", 65),
    ("ssc-cgl-2026-9-october-2026-shift-1", 64),
    ("ssc-cgl-2026-9-october-2026-shift-1", 65),
    ("ssc-cgl-2026-9-october-2026-shift-2", 62),
    ("ssc-cgl-2026-9-october-2026-shift-2", 70),
    ("ssc-cgl-2026-9-october-2026-shift-3", 61),
]

for base, qn in sample_fraction_items:
    pdf_file = os.path.join(f_drive, pdf_map[base])
    doc = fitz.open(pdf_file)
    print(f"\n==================== {base} Q.{qn} ====================")
    for pno, page in enumerate(doc):
        text = page.get_text()
        if f"{qn}." in text or f"{qn:02d}." in text:
            # print surrounding lines
            lines = text.split('\n')
            for i, l in enumerate(lines):
                if l.strip().startswith(f"{qn}.") or l.strip().startswith(f"{qn:02d}."):
                    print(f"P{pno+1} content:")
                    for j in range(max(0, i-1), min(len(lines), i+25)):
                        print(f"   {lines[j]}")
                    break
