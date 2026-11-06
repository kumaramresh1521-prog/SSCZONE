import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = glob.glob(os.path.join(backup_dir, "*2026*.json"))
print(f"Total 2026 backup files found: {len(files)}")

section_pattern = re.compile(r'\b(GENERAL\s+INTELLIGENCE(\s+(&|AND)\s+REASONING)?|GENERAL\s+AWARENESS|QUANTITATIVE\s+APTITUDE|ENGLISH\s+LANGUAGE|ENGLISH\s+COMPREHENSION)\b', re.I)

qt_artifacts = []
opt_artifacts = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
    
    for q in questions:
        qn = q["question_number"]
        qt = q.get("question_text", "")
        
        # Check section names in question_text
        m = section_pattern.search(qt)
        if m:
            qt_artifacts.append((fname, qn, m.group(0), qt[:100]))
            
        # Check options
        for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
            val = q.get(opt_k, "")
            # Section header in option
            m_sec = section_pattern.search(val)
            if m_sec:
                opt_artifacts.append((fname, qn, opt_k, m_sec.group(0), val))
            # Trailing page number
            elif re.search(r'\b[a-zA-Z\.\,\)\]]\s+\d{1,2}$', val.strip()) and not re.search(r'(Article|Rule|Schedule|Clause|Section|Shift|Tier|Option|Case|No|Group|Table|Fig|Figure|Part)\s+\d+$', val.strip(), re.I):
                m_num = re.search(r'\s+(\d{1,2})$', val.strip())
                if m_num and 1 <= int(m_num.group(1)) <= 25:
                    opt_artifacts.append((fname, qn, opt_k, f"page_{m_num.group(1)}", val))

print(f"\nTotal Question Text artifacts: {len(qt_artifacts)}")
for a in qt_artifacts:
    print(f"  {a[0]} | Q.{a[1]} | '{a[2]}' in: {repr(a[3])}")

print(f"\nTotal Option artifacts: {len(opt_artifacts)}")
print(f"First 30 option artifacts:")
for a in opt_artifacts[:30]:
    print(f"  {a[0]} | Q.{a[1]} {a[2]} | {a[3]} in: {repr(a[4])}")
