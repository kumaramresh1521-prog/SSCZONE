import json

with open('c:/ssczone/scripts/paper_inputs/paper_40.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Changed question numbers
changed_qnums = {9, 13, 14, 24, 28, 29, 31, 34, 36, 37, 55, 56, 57, 62, 64, 78, 86, 88, 89, 90}

print(f"Total questions: {len(questions)}")
print(f"Total changed questions: {len(changed_qnums)}")
print(f"Total unchanged questions: {len(questions) - len(changed_qnums)}")

# Let's inspect answer distribution after applying the patch:
new_answers = {}
for q in questions:
    qn = q['question_number']
    if qn in changed_qnums:
        # Find new answer
        pass
