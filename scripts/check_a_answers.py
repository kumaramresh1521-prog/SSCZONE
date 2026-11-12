import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/ssczone/scripts/paper_inputs/paper_39.json', encoding='utf-8') as f:
    data = json.load(f)

for q in data:
    if q['correct_answer'] == 'A':
        print(f"Q{q['question_number']} (ID {q['id']}): {q['question_text'][:70]} | Ans: {q['option_a'][:40]}")
