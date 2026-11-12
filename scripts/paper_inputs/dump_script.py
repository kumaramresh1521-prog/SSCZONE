import json

with open(r'c:\ssczone\scripts\paper_inputs\paper_27.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(r'c:\ssczone\scripts\paper_inputs\paper_27_dump.txt', 'w', encoding='utf-8') as out:
    for q in data:
        out.write(f"=== Q{q['question_number']} (ID: {q['id']}) [Current Answer: {q['correct_answer']}] ===\n")
        out.write(f"Question: {q['question_text']}\n")
        out.write(f"A: {q['option_a']}\n")
        out.write(f"B: {q['option_b']}\n")
        out.write(f"C: {q['option_c']}\n")
        out.write(f"D: {q['option_d']}\n")
        if q.get('explanation'):
            out.write(f"Explanation: {q['explanation']}\n")
        out.write("\n")

print(f"Dumped {len(data)} questions.")
