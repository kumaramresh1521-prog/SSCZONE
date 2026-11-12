import json

with open('c:/ssczone/scripts/paper_inputs/paper_53.json', encoding='utf-8') as f:
    questions = json.load(f)

def dump_range(start, end, filename):
    with open(filename, 'w', encoding='utf-8') as out:
        for q in questions:
            if start <= q['question_number'] <= end:
                out.write(f"--- Q{q['question_number']} (ID: {q['id']}, Stored: {q['correct_answer']}) ---\n")
                out.write(f"{q['question_text']}\n")
                out.write(f"A: {q['option_a']}\n")
                out.write(f"B: {q['option_b']}\n")
                out.write(f"C: {q['option_c']}\n")
                out.write(f"D: {q['option_d']}\n\n")

dump_range(1, 25, 'c:/ssczone/scripts/q1_25.txt')
dump_range(26, 50, 'c:/ssczone/scripts/q26_50.txt')
dump_range(51, 75, 'c:/ssczone/scripts/q51_75.txt')
dump_range(76, 100, 'c:/ssczone/scripts/q76_100.txt')
print("Dumped 4 files successfully.")
