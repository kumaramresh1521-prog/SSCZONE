import json

with open(r'c:\ssczone\scripts\paper_inputs\paper_27.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Let's inspect remaining non-A questions to ensure none are questionable.
non_a = [q for q in data if q['correct_answer'] != 'A']
with open(r'c:\ssczone\scripts\paper_inputs\check_non_a.txt', 'w', encoding='utf-8') as out:
    for q in non_a:
        out.write(f"Q{q['question_number']} (ID: {q['id']}) [Current: {q['correct_answer']}]:\n")
        out.write(f"  Text: {q['question_text'].replace(chr(10), ' ')[:120]}\n")
        out.write(f"  A: {q['option_a']}\n")
        out.write(f"  B: {q['option_b']}\n")
        out.write(f"  C: {q['option_c']}\n")
        out.write(f"  D: {q['option_d']}\n\n")

print(f"Total non-A questions: {len(non_a)}")
