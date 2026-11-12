import json

with open('kiran_type5_25_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

lines = []
for q in questions:
    lines.append(f"Question {q['q_num']}:")
    lines.append(q['question_text'].strip())
    lines.append("")
    opts = q['options']
    lines.append(f"(A) {opts[0]}")
    lines.append(f"(B) {opts[1]}")
    lines.append(f"(C) {opts[2]}")
    lines.append(f"(D) {opts[3]}")
    lines.append("")
    lines.append(f"Answer: ({q['correct_option']})")
    lines.append(f"Exam: {q['exam_tag']}")
    lines.append("Explanation:")
    lines.append(q['explanation'].strip())
    lines.append("")
    lines.append("--------------------------------------------------------------------------------")
    lines.append("")

text = "\n".join(lines)

with open('batch5_type5_mixed_analogy_verified.txt', 'w', encoding='utf-8') as f:
    f.write(text)

with open('public/batch5_type5_mixed_analogy_verified.txt', 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Exported Batch 5 text file: {len(text)} characters, {len(questions)} questions.")
