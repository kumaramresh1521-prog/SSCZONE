import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/ssczone/scripts/paper_inputs/paper_52.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

def print_range(start_idx, end_idx):
    for q in questions[start_idx:end_idx]:
        print(f"=== Q{q['question_number']} (ID: {q['id']}) === Current: {q.get('correct_answer')}")
        print(q['question_text'])
        print("A:", q.get('option_a'))
        print("B:", q.get('option_b'))
        print("C:", q.get('option_c'))
        print("D:", q.get('option_d'))
        print("-" * 50)

if __name__ == '__main__':
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 25
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    print_range(start, end)
