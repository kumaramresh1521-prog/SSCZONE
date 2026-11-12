import json

with open('c:/ssczone/scripts/paper_inputs/paper_51.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

def dump_range(start, end, filename):
    with open(filename, 'w', encoding='utf-8') as out:
        for q in qs[start-1:end]:
            out.write(f"=== Q{q['question_number']} (id={q['id']}) ===\n")
            out.write(f"Text: {q['question_text']}\n")
            out.write(f"A: {q['option_a']}\n")
            out.write(f"B: {q['option_b']}\n")
            out.write(f"C: {q['option_c']}\n")
            out.write(f"D: {q['option_d']}\n")
            out.write(f"Current Ans: {q['correct_answer']}\n\n")

dump_range(1, 25, 'c:/ssczone/scripts/p51_reasoning.txt')
dump_range(26, 50, 'c:/ssczone/scripts/p51_ga.txt')
dump_range(51, 75, 'c:/ssczone/scripts/p51_quant.txt')
dump_range(76, 100, 'c:/ssczone/scripts/p51_english.txt')
print("Dumped all 4 sections!")
