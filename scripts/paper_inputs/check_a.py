import json, sys

with open(r'c:\ssczone\scripts\paper_inputs\paper_27.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(r'c:\ssczone\scripts\paper_inputs\check_a_out.txt', 'w', encoding='utf-8') as out:
    for q in data:
        if q['correct_answer'] == 'A':
            out.write(f"Q{q['question_number']} (ID: {q['id']}):\n")
            out.write(f"  Q: {q['question_text'].replace(chr(10), ' ')[:100]}\n")
            out.write(f"  A: {q['option_a']}\n")
            out.write(f"  B: {q['option_b']}\n")
            out.write(f"  C: {q['option_c']}\n")
            out.write(f"  D: {q['option_d']}\n\n")

print("Done writing check_a_out.txt")
