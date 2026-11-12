import json
from collections import Counter

with open('scripts/paper_inputs/paper_49.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

print(f"Total questions: {len(qs)}")
c = Counter(q['correct_answer'] for q in qs)
print("Answer distribution:", c)

for q in qs:
    qn = q['question_number']
    ans = q['correct_answer']
    text = q['question_text'].replace('\n', ' ')[:70]
    # print all questions
    print(f"Q{qn:02d} [{ans}]: {text}")
