import json

with open(r'c:\ssczone\scripts\paper_inputs\paper_34.json', encoding='utf-8') as f:
    data = json.load(f)

with open(r'c:\ssczone\scripts\all_a_out.txt', 'w', encoding='utf-8') as out:
    for q in data:
        if q['correct_answer'] == 'A':
            out.write(f"Q{q['question_number']} (ID: {q['id']}):\n")
            out.write(f"  Q: {q['question_text']}\n")
            out.write(f"  A: {q['option_a']}\n")
            out.write(f"  B: {q['option_b']}\n")
            out.write(f"  C: {q['option_c']}\n")
            out.write(f"  D: {q['option_d']}\n")
            out.write("-" * 50 + "\n")
print("Wrote all_a_out.txt")
