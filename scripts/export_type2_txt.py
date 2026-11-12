import json

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

lines = []
lines.append('================================================================================')
lines.append('   SSC REASONING - CHAPTER 2: ANALOGY OR SIMILARITY')
lines.append('   TYPE-II: NUMBER ANALOGY (संख्या सादृश्यता)')
lines.append('   TOTAL QUESTIONS: 307 (100% VERIFIED & AUDITED WITH DETAILED EXPLANATIONS)')
lines.append('================================================================================\n')

for q in data:
    qn = q['question_number']
    lines.append(f"Question {qn}:")
    lines.append(q['question_text'].strip())
    lines.append('')
    lines.append(f"(A) {q['option_a']}")
    lines.append(f"(B) {q['option_b']}")
    lines.append(f"(C) {q['option_c']}")
    lines.append(f"(D) {q['option_d']}")
    lines.append('')
    lines.append(f"Answer: ({q['correct_option']})")
    if q.get('exam_tag'):
        lines.append(f"Exam: {q['exam_tag'].strip()}")
    lines.append("Explanation:")
    lines.append(q['explanation'].strip())
    lines.append('\n' + '-'*80 + '\n')

content = '\n'.join(lines)
with open('batch2_type2_number_analogy_verified.txt', 'w', encoding='utf-8') as f:
    f.write(content)
with open('public/batch2_type2_number_analogy_verified.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully generated text files! Total characters: {len(content)}, Questions: {len(data)}")
