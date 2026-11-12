import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def dump_range(start, end):
    with open('c:/ssczone/scripts/paper_inputs/paper_39.json', encoding='utf-8') as f:
        data = json.load(f)
    for q in data[start-1:end]:
        print(f"=== Q{q['question_number']} (ID: {q['id']}) [Current: {q['correct_answer']}] ===")
        print(q['question_text'])
        print(f"A: {q['option_a']}")
        print(f"B: {q['option_b']}")
        print(f"C: {q['option_c']}")
        print(f"D: {q['option_d']}")
        print()

if __name__ == '__main__':
    s = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    e = int(sys.argv[2]) if len(sys.argv) > 2 else 25
    dump_range(s, e)
