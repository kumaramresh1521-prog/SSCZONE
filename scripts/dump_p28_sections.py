import json

with open('c:/ssczone/scripts/paper_inputs/paper_28.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

def dump_range(start, end, outfile):
    with open(outfile, 'w', encoding='utf-8') as out:
        for q in questions[start-1:end]:
            out.write(f"=== Q{q['question_number']} (ID: {q['id']}) ===\n")
            out.write(f"Question: {q['question_text']}\n")
            out.write(f"A: {q['option_a']}\n")
            out.write(f"B: {q['option_b']}\n")
            out.write(f"C: {q['option_c']}\n")
            out.write(f"D: {q['option_d']}\n")
            out.write(f"Current Answer: {q['correct_answer']}\n\n")

dump_range(1, 25, 'c:/ssczone/scripts/p28_q1_25.txt')
dump_range(26, 50, 'c:/ssczone/scripts/p28_q26_50.txt')
dump_range(51, 75, 'c:/ssczone/scripts/p28_q51_75.txt')
dump_range(76, 100, 'c:/ssczone/scripts/p28_q76_100.txt')
print("Dumped p28 questions successfully!")
