import fitz
import sys
import os
import glob
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
files_2026 = sorted(glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json')))

results = []
for fpath in files_2026:
    base = os.path.basename(fpath).replace('.json', '')
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        qn = q['question_number']
        opts = [q['option_a'].strip(), q['option_b'].strip(), q['option_c'].strip(), q['option_d'].strip()]
        if len(set(opts)) < 4:
            dupes = [x for x in opts if opts.count(x) > 1]
            results.append((base, qn, opts, set(dupes), q['correct_answer']))

print(f"Total questions with duplicate options in 2026: {len(results)}")
for base, qn, opts, dupes, ans in results:
    print(f"- {base} Q.{qn} [Ans: {ans}]: Duplicate '{list(dupes)[0]}'")
