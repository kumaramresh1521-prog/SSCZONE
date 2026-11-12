import json

with open('c:/ssczone/scripts/paper_inputs/paper_40.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions.")

# Let's count current distribution of answers:
from collections import Counter
counts = Counter(q['correct_answer'] for q in questions)
print("Answer distribution:", counts)

# Also let's print all questions with answer 'A'
a_questions = [q for q in questions if q['correct_answer'] == 'A']
print(f"Total 'A' answers: {len(a_questions)}")
print("Q numbers with 'A':", [q['question_number'] for q in a_questions])
