import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/ssczone/scripts/paper_inputs/paper_37.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

start = int(sys.argv[1]) if len(sys.argv) > 1 else 1
end = int(sys.argv[2]) if len(sys.argv) > 2 else 25

for q in questions:
    if start <= q['question_number'] <= end:
        print(f"=== Q{q['question_number']} (ID: {q['id']}) ===")
        print(f"Text: {q['question_text']}")
        print(f"A: {q['option_a']}")
        print(f"B: {q['option_b']}")
        print(f"C: {q['option_c']}")
        print(f"D: {q['option_d']}")
        print(f"Current: {q['correct_answer']}")
        if q.get('explanation'):
            print(f"Expl: {q['explanation']}")
        print()
