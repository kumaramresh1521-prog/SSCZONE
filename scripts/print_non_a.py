import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/ssczone/scripts/paper_inputs/paper_28.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)
for q in qs:
    if q['correct_answer'] != 'A':
        print(f"Q{q['question_number']}: ans={q['correct_answer']} - {q['question_text'][:70]}...")
