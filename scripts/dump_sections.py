import json

with open('c:/ssczone/scripts/paper_inputs/paper_40.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

def dump_range(start, end, filename):
    with open(filename, 'w', encoding='utf-8') as out:
        for q in questions[start-1:end]:
            out.write(f"--- Q{q['question_number']} (ID: {q['id']}) [Current Ans: {q['correct_answer']}] ---\n")
            out.write(f"Question: {q['question_text']}\n")
            out.write(f"A: {q['option_a']}\n")
            out.write(f"B: {q['option_b']}\n")
            out.write(f"C: {q['option_c']}\n")
            out.write(f"D: {q['option_d']}\n")
            if q.get('explanation'):
                out.write(f"Explanation: {q['explanation']}\n")
            out.write("\n")

dump_range(1, 25, 'c:/ssczone/scripts/p40_q01_25.txt')
dump_range(26, 50, 'c:/ssczone/scripts/p40_q26_50.txt')
dump_range(51, 75, 'c:/ssczone/scripts/p40_q51_75.txt')
dump_range(76, 100, 'c:/ssczone/scripts/p40_q76_100.txt')
print("Successfully dumped all 4 sections.")
