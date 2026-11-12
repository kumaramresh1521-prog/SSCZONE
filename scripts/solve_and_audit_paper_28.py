import json

with open('c:/ssczone/scripts/paper_inputs/paper_28.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions.")

# Let's verify each question by question number
# We will create a dictionary of answers: {q_num: (correct_opt, reason)}
