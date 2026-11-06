import os
import glob
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'

# Map of paper_id to json filename based on exam date order
paper_mapping = [
    (25, "ssc-cgl-2026-30-september-2026-shift-2", "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"),
    (26, "ssc-cgl-2026-30-september-2026-shift-3", "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"),
    (27, "ssc-cgl-2026-1-october-2026-shift-1", "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"),
    (28, "ssc-cgl-2026-1-october-2026-shift-2", "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 2).pdf"),
    (29, "ssc-cgl-2026-1-october-2026-shift-3", "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf"),
    (30, "ssc-cgl-2026-5-october-2026-shift-1", "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 1).pdf"),
    (31, "ssc-cgl-2026-5-october-2026-shift-2", "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 2).pdf"),
    (32, "ssc-cgl-2026-5-october-2026-shift-3", "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 3).pdf"),
    (33, "ssc-cgl-2026-6-october-2026-shift-1", "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 1).pdf"),
    (34, "ssc-cgl-2026-6-october-2026-shift-2", "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 2).pdf"),
    (35, "ssc-cgl-2026-6-october-2026-shift-3", "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf"),
    (36, "ssc-cgl-2026-7-october-2026-shift-1", "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 1).pdf"),
    (37, "ssc-cgl-2026-7-october-2026-shift-2", "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 2).pdf"),
    (38, "ssc-cgl-2026-7-october-2026-shift-3", "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 3).pdf"),
    (39, "ssc-cgl-2026-8-october-2026-shift-1", "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 1).pdf"),
    (40, "ssc-cgl-2026-8-october-2026-shift-2", "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 2).pdf"),
    (41, "ssc-cgl-2026-8-october-2026-shift-3", "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 3).pdf"),
    (42, "ssc-cgl-2026-9-october-2026-shift-1", "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 1).pdf"),
    (43, "ssc-cgl-2026-9-october-2026-shift-2", "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 2).pdf"),
    (44, "ssc-cgl-2026-9-october-2026-shift-3", "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 3).pdf"),
    (45, "ssc-cgl-2026-10-october-2026-shift-1", "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 1).pdf"),
    (46, "ssc-cgl-2026-10-october-2026-shift-2", "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf"),
    (47, "ssc-cgl-2026-10-october-2026-shift-3", "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf"),
    (48, "ssc-cgl-2026-12-october-2026-shift-1", "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 1).pdf"),
    (49, "ssc-cgl-2026-12-october-2026-shift-2", "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 2).pdf"),
    (50, "ssc-cgl-2026-12-october-2026-shift-3", "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf"),
    (51, "ssc-cgl-2026-13-october-2026-shift-1", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 1).pdf"),
    (52, "ssc-cgl-2026-13-october-2026-shift-2", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf"),
    (53, "ssc-cgl-2026-13-october-2026-shift-3", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 3).pdf"),
]

total_issues = 0
for pid, base, pdf_name in paper_mapping:
    json_path = os.path.join(backup_dir, f"{base}.json")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    paper_issues = []
    for q in data:
        qn = q['question_number']
        qt = q['question_text'].strip()
        
        # 1. Figure only
        if re.fullmatch(r'!\[Figure\]\([^\)]+\)', qt):
            paper_issues.append((qn, "FIGURE_ONLY_QT", qt[:40]))
            
        # 2. Cloze test truncated prompt
        if re.search(r'fills\s+blank\s*$', qt, re.IGNORECASE) or re.search(r'fills\s+blank\s*[:\?]?\s*$', qt, re.IGNORECASE):
            paper_issues.append((qn, "CLOZE_TRUNCATED", qt[-40:]))
            
        # 3. Trailing page numbers in question text (e.g. "something's off. 9")
        if re.search(r'\.\s+\d{1,2}$', qt):
            paper_issues.append((qn, "TRAILING_PAGE_NUM", qt[-20:]))
            
        # 4. Stray headers in options
        for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
            v = q[opt].strip()
            for kw in ['GENERAL', 'QUANTITATIVE', 'BASIC ARITHMETIC', 'ENGLISH LANGUAGE', 'BASIC KNOWLEDGE']:
                if kw in v:
                    paper_issues.append((qn, f"STRAY_HEADER_{opt}", v))
                    break
            if re.search(r'^\d+\s+\d+\s+\d+$', v):
                paper_issues.append((qn, f"GARBLED_FRACTION_{opt}", v))
            elif v.endswith('-') and not v.endswith(' -'):
                paper_issues.append((qn, f"TRUNCATED_DASH_{opt}", v))
                
    if paper_issues:
        print(f"\n[ID {pid}] {base} ({len(paper_issues)} issues):")
        for iss in paper_issues[:8]:
            print(f"   Q.{iss[0]} {iss[1]}: {iss[2]}")
        if len(paper_issues) > 8:
            print(f"   ... and {len(paper_issues) - 8} more issues")
        total_issues += len(paper_issues)
    else:
        print(f"[ID {pid}] {base}: CLEAN ✅")

print(f"\nTotal detected issues across 29 papers: {total_issues}")
