import json
import glob
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'

# Check 2026 files for duplicate options
files_2026 = sorted(glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json')))
files_2025 = sorted(glob.glob(os.path.join(backup_dir, 'ssc-cgl-2025-*.json')))

def check_duplicates(files, label):
    total_dupes = 0
    dupe_list = []
    for fpath in files:
        fname = os.path.basename(fpath)
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for q in data:
            qn = q['question_number']
            opts = [q['option_a'].strip(), q['option_b'].strip(), q['option_c'].strip(), q['option_d'].strip()]
            # check if any two are identical
            if len(set(opts)) < 4:
                total_dupes += 1
                dupe_list.append((fname, qn, opts, q['correct_answer']))
    print(f"\n=== {label} ===")
    print(f"Total questions with duplicate options: {total_dupes}")
    for item in dupe_list[:15]:
        print(f"  {item[0]} Q.{item[1]} [Ans: {item[3]}]:")
        print(f"     A: {item[2][0]}")
        print(f"     B: {item[2][1]}")
        print(f"     C: {item[2][2]}")
        print(f"     D: {item[2][3]}")
    if len(dupe_list) > 15:
        print(f"  ... and {len(dupe_list) - 15} more questions")
    return dupe_list

dupes_2026 = check_duplicates(files_2026, "2026 PAPERS")
dupes_2025 = check_duplicates(files_2025, "2025 PAPERS")
