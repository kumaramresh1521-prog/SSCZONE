import json

with open(r'c:\ssczone\scripts\paper_inputs\paper_41.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(r'c:\ssczone\scripts\paper_41_dump.txt', 'w', encoding='utf-8') as f:
    for q in data:
        f.write(f"Q{q['question_number']} | ID: {q['id']} | Current Ans: {q['correct_answer']}\n")
        f.write(f"Question: {q['question_text']}\n")
        f.write(f"A) {q['option_a']}\n")
        f.write(f"B) {q['option_b']}\n")
        f.write(f"C) {q['option_c']}\n")
        f.write(f"D) {q['option_d']}\n")
        f.write("="*60 + "\n\n")

print(f"Dumped {len(data)} questions.")
