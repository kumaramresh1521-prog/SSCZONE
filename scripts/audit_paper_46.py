import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\ssczone\scripts\paper_inputs\paper_46.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

def list_a_questions():
    a_qs = [q for q in questions if q['correct_answer'] == 'A']
    print(f"Total 'A' questions: {len(a_qs)}")
    for q in a_qs:
        qn = q['question_number']
        txt = q['question_text'].replace('\n', ' ')
        print(f"Q{qn} (ID {q['id']}): {txt[:100]}")

def show_question(qn):
    for q in questions:
        if q['question_number'] == qn:
            print("="*60)
            print(f"Q{q['question_number']} (ID: {q['id']}) - Current Answer: {q['correct_answer']}")
            print(f"Question: {q['question_text']}")
            print(f"A: {q['option_a']}")
            print(f"B: {q['option_b']}")
            print(f"C: {q['option_c']}")
            print(f"D: {q['option_d']}")
            if q.get('explanation'):
                print(f"Explanation: {q['explanation']}")
            return

def show_range(start_qn, end_qn):
    for qn in range(start_qn, end_qn + 1):
        show_question(qn)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == 'list_a':
            list_a_questions()
        elif sys.argv[1] == 'show':
            show_question(int(sys.argv[2]))
        elif sys.argv[1] == 'range':
            show_range(int(sys.argv[2]), int(sys.argv[3]))

