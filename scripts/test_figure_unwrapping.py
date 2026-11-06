import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
from test_cleaners import unwrap_question_text

with open(r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-8-october-2026-shift-1.json', encoding='utf-8') as f:
    qs = json.load(f)

for q in qs:
    if '![Figure]' in q['question_text']:
        qn = q['question_number']
        print(f"=== Q.{qn} BEFORE ===")
        print(repr(q['question_text']))
        print(f"=== Q.{qn} AFTER ===")
        print(unwrap_question_text(q['question_text']))
        print("-" * 50)
        break
