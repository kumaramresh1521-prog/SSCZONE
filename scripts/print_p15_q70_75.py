import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('tmp_9_papers_pure_english.json', 'r', encoding='utf-8') as f:
    papers = json.load(f)

for p in papers:
    if p['paper_id'] == 15:
        for q in p['questions']:
            if 70 <= q['question_number'] <= 75:
                print(f"Q{q['question_number']}: {q['question_text']}")
                print(f"  A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}")
                print(f"  Ans: {q['correct_answer']}\n")
