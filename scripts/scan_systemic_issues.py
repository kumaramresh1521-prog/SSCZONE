import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
files = glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json'))

print(f"Total papers found: {len(files)}")

only_figure_qt = []
truncated_blank_qt = []
broken_options = []
missing_di_text = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for q in data:
        qn = q['question_number']
        qt = q['question_text'].strip()

        # 1. Question text is ONLY an image tag
        if re.fullmatch(r'!\[Figure\]\([^\)]+\)', qt):
            only_figure_qt.append((fname, qn, qt))

        # 2. English cloze test truncated at "fills blank" or similar
        if re.search(r'fills\s+blank\s*$', qt, re.IGNORECASE) or re.search(r'fills\s+blank\s*[:\?]?\s*$', qt, re.IGNORECASE):
            truncated_blank_qt.append((fname, qn, qt[-50:]))

        # 3. Truncated option or garbled fractions like '4 5 5', '7 5 5', '121 GENERAL', ends with hyphen
        for opt_key in ['option_a', 'option_b', 'option_c', 'option_d']:
            opt_val = q[opt_key].strip()
            if opt_val.endswith('-') or 'GENERAL' in opt_val or re.search(r'^\d+\s+\d+\s+\d+$', opt_val):
                broken_options.append((fname, qn, opt_key, opt_val))

print(f"\n1. Questions where question_text is ONLY an image (no text instruction): {len(only_figure_qt)}")
if only_figure_qt:
    # Group by paper
    papers_with_only_fig = {}
    for fn, qn, _ in only_figure_qt:
        papers_with_only_fig[fn] = papers_with_only_fig.get(fn, 0) + 1
    print(f"   Present in {len(papers_with_only_fig)} papers!")
    for fn, cnt in sorted(papers_with_only_fig.items())[:5]:
        print(f"   - {fn}: {cnt} questions")

print(f"\n2. English Cloze Test questions ending with truncated 'fills blank': {len(truncated_blank_qt)}")
if truncated_blank_qt:
    papers_with_cloze = {}
    for fn, qn, _ in truncated_blank_qt:
        papers_with_cloze[fn] = papers_with_cloze.get(fn, 0) + 1
    print(f"   Present in {len(papers_with_cloze)} papers!")
    for fn, cnt in sorted(papers_with_cloze.items())[:5]:
        print(f"   - {fn}: {cnt} questions")

print(f"\n3. Broken/truncated options found: {len(broken_options)}")
if broken_options:
    for item in broken_options[:10]:
        print(f"   - {item[0]} Q.{item[1]} [{item[2]}]: {item[3]}")
