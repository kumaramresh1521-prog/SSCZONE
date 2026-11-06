import os
import glob
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
files = sorted(glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json')))

fig_only_by_subject = {'Reasoning': [], 'Math': [], 'Other': []}

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        qn = q['question_number']
        qt = q['question_text'].strip()
        if re.fullmatch(r'!\[Figure\]\([^\)]+\)', qt):
            if 1 <= qn <= 25:
                fig_only_by_subject['Reasoning'].append((fname, qn, qt))
            elif 51 <= qn <= 75:
                fig_only_by_subject['Math'].append((fname, qn, qt))
            else:
                fig_only_by_subject['Other'].append((fname, qn, qt))

print(f"Reasoning figure-only questions: {len(fig_only_by_subject['Reasoning'])}")
print(f"Math figure-only questions: {len(fig_only_by_subject['Math'])}")
print(f"Other figure-only questions: {len(fig_only_by_subject['Other'])}")

print("\nSample Math figure-only questions:")
for item in fig_only_by_subject['Math'][:10]:
    print(f"  {item[0]} Q.{item[1]}: {item[2]}")
