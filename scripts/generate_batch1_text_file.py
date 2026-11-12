import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

lines = []
lines.append("=" * 80)
lines.append("SSC REASONING CHAPTERWISE (KIRAN PYQ) - 100% VERIFIED QUESTION BANK")
lines.append("CHAPTER : ANALOGY OR SIMILARITY (सादृश्यता या समानता)")
lines.append("BATCH 1 : TYPE-I (WORD ANALOGY - 284 QUESTIONS)")
lines.append("ALL QUESTIONS VERIFIED WITH OFFICIAL ANSWER KEY & AUTHENTIC EXPLANATIONS")
lines.append("=" * 80)
lines.append("")

for q in questions:
    qnum = q['question_number']
    tag = q.get('exam_tag', 'SSC PYQ')
    lines.append("=" * 80)
    lines.append(f"QUESTION {qnum} [Exam: {tag}]")
    lines.append(f"Type: Type-I (Word Analogy) | Difficulty: Medium")
    lines.append("-" * 80)
    lines.append(q['question_text'])
    lines.append("")
    lines.append(f"(A) {q['option_a']}")
    lines.append(f"(B) {q['option_b']}")
    lines.append(f"(C) {q['option_c']}")
    lines.append(f"(D) {q['option_d']}")
    lines.append("")
    lines.append(f"Correct Answer : ({q['correct_answer']})")
    lines.append(f"Explanation    : {q['explanation']}")
    lines.append("=" * 80)
    lines.append("")

full_content = "\n".join(lines)

# Save to root
with open('batch1_type1_word_analogy_284_verified.txt', 'w', encoding='utf-8') as f:
    f.write(full_content)

# Also save to public for direct web view / download
os.makedirs('public', exist_ok=True)
with open('public/batch1_type1_word_analogy_284_verified.txt', 'w', encoding='utf-8') as f:
    f.write(full_content)

print(f"Generated text file with {len(questions)} questions!")
print(f"File size: {len(full_content)} characters, ~{len(lines)} lines.")
