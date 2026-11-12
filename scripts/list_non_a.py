import json

with open('c:/ssczone/scripts/paper_inputs/paper_52.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

non_a = [q for q in questions if q.get('correct_answer') != 'A']
print(f"Total non-A questions: {len(non_a)}")
for q in non_a:
    print(f"Q{q['question_number']} (Ans: {q.get('correct_answer')}): {q['question_text'][:60]}")
