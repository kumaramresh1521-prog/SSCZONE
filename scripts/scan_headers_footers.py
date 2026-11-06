import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = glob.glob(os.path.join(backup_dir, "*2026*.json"))

header_footer_patterns = [
    r'\b\d+\s*\(\s*BASIC\s+KNOWLEDGE\s*\)',
    r'\(\s*BASIC\s+KNOWLEDGE\s*\)',
    r'\b(GENERAL\s+INTELLIGENCE(\s+(&|AND)\s+REASONING)?|GENERAL\s+AWARENESS|QUANTITATIVE\s+APTITUDE|ENGLISH\s+LANGUAGE|ENGLISH\s+COMPREHENSION)\b',
    r'Comprehension\s*\(\s*Q\.?\s*\d+\s*[-–]\s*\d+\s*\)',
]

combined_hf = re.compile('|'.join(header_footer_patterns), re.I)

total_qt_issues = 0
total_opt_issues = 0

qt_samples = []
opt_samples = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
    
    for q in questions:
        qn = q["question_number"]
        qt = q.get("question_text", "")
        
        # Check question text
        m_qt = combined_hf.search(qt)
        if m_qt:
            total_qt_issues += 1
            qt_samples.append((fname, qn, m_qt.group(0), qt))
            
        # Check options
        for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
            val = q.get(opt_k, "")
            m_opt = combined_hf.search(val)
            if m_opt:
                total_opt_issues += 1
                opt_samples.append((fname, qn, opt_k, m_opt.group(0), val))

print(f"Total question texts with header/footer patterns: {total_qt_issues}")
print(f"Total options with header/footer patterns: {total_opt_issues}")

print("\n--- SAMPLE QUESTION TEXT ISSUES (first 15) ---")
for s in qt_samples[:15]:
    print(f"{s[0]} | Q.{s[1]} | Pattern: {s[2]}")
    print(f"   Snippet: {repr(s[3][-100:])}")

print("\n--- SAMPLE OPTION ISSUES (first 15) ---")
for s in opt_samples[:15]:
    print(f"{s[0]} | Q.{s[1]} {s[2]} | Pattern: {s[3]}")
    print(f"   Snippet: {repr(s[4][:80])} ... {repr(s[4][-50:])}")
