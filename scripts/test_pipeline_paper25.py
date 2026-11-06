import json
import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# Import our helper functions
from test_cleaners import unwrap_question_text, clean_option_text

# Load paper 25 JSON
fpath = r"c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-30-september-2026-shift-2.json"
with open(fpath, "r", encoding="utf-8") as f:
    questions = json.load(f)

print(f"Total questions in {os.path.basename(fpath)}: {len(questions)}")

# Check Comprehension in paper 25:
# In scan_comprehension_all.py:
# ssc-cgl-2026-30-september-2026-shift-2.json | Q.87 option_d -> 'Living in a house near the water Comprehension (Q. 88 - 92)...'
q87 = questions[86]
print("Q.87 Opt D before:\n", repr(q87['option_d'][:100]))

val = q87['option_d']
m = re.search(r'Comprehension\s*\(\s*Q\.?\s*(\d+)\s*[-–]\s*(\d+)\s*\)', val, re.I)
if m:
    q_start = int(m.group(1))
    q_end = int(m.group(2))
    split_idx = val.find(m.group(0))
    before = val[:split_idx].strip()
    sec_m = re.search(r'\b(ENGLISH\s+LANGUAGE|GENERAL\s+AWARENESS|QUANTITATIVE\s+APTITUDE|GENERAL\s+INTELLIGENCE)\s*$', before, re.I)
    clean_opt = before[:sec_m.start()].strip() if sec_m else before
    passage = val[split_idx:].strip()
    
    # Strip any leading "Comprehension (Q. X - Y)" for the body
    m_body = re.search(r'Comprehension\s*\(\s*Q\.?\s*\d+\s*[-–]\s*\d+\s*\)\s*(?:Read the passage.*?:)?\s*(.*)', passage, re.S | re.I)
    passage_body = m_body.group(1).strip() if m_body else passage
    unwrapped_passage = unwrap_question_text(passage_body)
    
    print("Clean Option D:", repr(clean_opt))
    print(f"Target Questions: {q_start} to {q_end}")
    print("Unwrapped Passage Preview:\n", unwrapped_passage[:200])

print("\n--- SAMPLE QUESTION TEXT BEFORE VS AFTER ---")
for qn_to_check in [1, 3, 7, 10, 88]:
    q = questions[qn_to_check - 1]
    print(f"\n=== Q.{qn_to_check} BEFORE ===")
    print(repr(q['question_text']))
    unwrapped = unwrap_question_text(q['question_text'])
    print(f"=== Q.{qn_to_check} AFTER ===")
    print(unwrapped)
