import json
import sys

with open(r'c:\ssczone\scripts\paper_inputs\paper_34.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for batch_name, s, e in [('reasoning', 1, 25), ('ga', 26, 50), ('quant', 51, 75), ('english', 76, 100)]:
    lines = []
    for q in questions:
        qn = q['question_number']
        if s <= qn <= e:
            lines.append(f"=== Q{qn} (ID: {q['id']}) Stored Ans: {q['correct_answer']} ===")
            lines.append(f"Q: {q['question_text']}")
            lines.append(f"  A: {q['option_a']}")
            lines.append(f"  B: {q['option_b']}")
            lines.append(f"  C: {q['option_c']}")
            lines.append(f"  D: {q['option_d']}")
            lines.append("")
    with open(rf'c:\ssczone\scripts\{batch_name}.txt', 'w', encoding='utf-8') as out:
        out.write("\n".join(lines))

print("Dumped all 4 sections successfully!")
