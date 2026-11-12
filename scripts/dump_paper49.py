import json

with open('scripts/paper_inputs/paper_49.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

with open('scripts/paper_49_full_details.txt', 'w', encoding='utf-8') as out:
    for q in qs:
        out.write(f"==================================================\n")
        out.write(f"QUESTION {q['question_number']} (ID: {q['id']})\n")
        out.write(f"Current Stored Answer: {q['correct_answer']}\n")
        out.write(f"Question: {q['question_text']}\n")
        out.write(f"A: {q['option_a']}\n")
        out.write(f"B: {q['option_b']}\n")
        out.write(f"C: {q['option_c']}\n")
        out.write(f"D: {q['option_d']}\n\n")

print(f"Dumped {len(qs)} questions to scripts/paper_49_full_details.txt")
