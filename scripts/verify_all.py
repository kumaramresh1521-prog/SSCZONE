import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/ssczone/scripts/paper_inputs/paper_39.json', encoding='utf-8') as f:
    data = json.load(f)

with open('c:/ssczone/scripts/paper_39_full_dump.utf8.txt', 'w', encoding='utf-8') as out:
    for q in data:
        q_num = q['question_number']
        ans = q['correct_answer']
        out.write(f"[{q_num}] (ID {q['id']}) Current Ans: {ans}\n")
        out.write(f"Text: {q['question_text']}\n")
        out.write(f"A: {q['option_a']}\n")
        out.write(f"B: {q['option_b']}\n")
        out.write(f"C: {q['option_c']}\n")
        out.write(f"D: {q['option_d']}\n")
        out.write("-" * 50 + "\n")

