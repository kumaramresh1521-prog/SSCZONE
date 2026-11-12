import json

with open('c:/ssczone/scripts/paper_inputs/paper_28.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions: {len(questions)}")
ans_counts = {}
for q in questions:
    a = q.get('correct_answer')
    ans_counts[a] = ans_counts.get(a, 0) + 1
print("Current answer distribution:", ans_counts)

def print_q(q):
    print(f"--- Q{q['question_number']} (ID: {q['id']}) ---")
    print("Q:", q['question_text'])
    print("A:", q['option_a'])
    print("B:", q['option_b'])
    print("C:", q['option_c'])
    print("D:", q['option_d'])
    print("Current Answer:", q['correct_answer'])
    if q.get('explanation'):
        print("Explanation:", q['explanation'])

for q in questions[:10]:
    print_q(q)
