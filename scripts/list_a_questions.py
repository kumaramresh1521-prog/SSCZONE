import json

with open('c:/ssczone/scripts/paper_inputs/paper_52.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

a_questions = [q for q in questions if q.get('correct_answer') == 'A']
print(f"Total questions with 'A': {len(a_questions)}")
print("Question numbers with 'A':", [q['question_number'] for q in a_questions])
