import fitz
import sys
import os
import glob
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
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

files_2026 = sorted(glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json')))

dupes = []
for fpath in files_2026:
    base = os.path.basename(fpath).replace('.json', '')
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        qn = q['question_number']
        opts = [q['option_a'].strip(), q['option_b'].strip(), q['option_c'].strip(), q['option_d'].strip()]
        if len(set(opts)) < 4:
            dupes.append((base, qn, opts, q['correct_answer']))

print(f"Total dupes to inspect in PDF: {len(dupes)}")

# Open each PDF and grab surrounding lines for question
current_base = None
doc = None

for base, qn, opts, ans in dupes:
    if base != current_base:
        current_base = base
        pdf_file = os.path.join(f_drive, pdf_map[base])
        doc = fitz.open(pdf_file)
    
    print(f"\n==================== {base} Q.{qn} [Ans: {ans}] ====================")
    print(f"Current JSON: A={opts[0]} | B={opts[1]} | C={opts[2]} | D={opts[3]}")
    
    # search page for qn
    found = False
    for pno, page in enumerate(doc):
        text = page.get_text()
        lines = text.split('\n')
        for i, l in enumerate(lines):
            l_str = l.strip()
            if l_str.startswith(f"{qn}.") or l_str.startswith(f"{qn:02d}."):
                found = True
                print(f"PDF Page {pno+1} extract:")
                for j in range(max(0, i), min(len(lines), i+22)):
                    print(f"   {lines[j]}")
                break
        if found:
            break
