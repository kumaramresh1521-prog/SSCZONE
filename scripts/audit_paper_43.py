import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/paper_inputs/paper_43.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

def dump_range(start, end):
    for q in questions[start-1:end]:
        print(f"=== Q{q['question_number']} (ID: {q['id']}) | Current Ans: {q['correct_answer']} ===")
        print(q['question_text'])
        print(f"  (A) {q['option_a']}")
        print(f"  (B) {q['option_b']}")
        print(f"  (C) {q['option_c']}")
        print(f"  (D) {q['option_d']}")
        print()

if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else '1-25'
    s, e = map(int, arg.split('-'))
    dump_range(s, e)
