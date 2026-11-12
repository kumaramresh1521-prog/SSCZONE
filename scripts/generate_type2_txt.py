import json
import shutil
import os

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

lines = []
lines.append("================================================================================")
lines.append("SSC REASONING CHAPTERWISE (KIRAN PYQ) - 100% VERIFIED QUESTION BANK")
lines.append("CHAPTER : ANALOGY OR SIMILARITY (सादृश्यता या समानता)")
lines.append("BATCH 2 : TYPE-II (NUMBER ANALOGY - 307 QUESTIONS)")
lines.append("ALL QUESTIONS VERIFIED WITH STEP-BY-STEP MATHEMATICAL SOLUTIONS & EXAM TAGS")
lines.append("================================================================================\n")

for it in qs:
    q_num = it['question_number']
    exam = it['exam_tag'].strip('() ')
    exam_str = f" [Exam: {exam}]" if exam else ""
    
    lines.append("================================================================================")
    lines.append(f"QUESTION {q_num}{exam_str}")
    lines.append("Type: Type-II (Number Analogy) | Difficulty: Medium")
    lines.append("--------------------------------------------------------------------------------")
    lines.append(it['question_text'].strip())
    lines.append("")
    lines.append(f"(A) {it['option_a'].strip()}")
    lines.append(f"(B) {it['option_b'].strip()}")
    lines.append(f"(C) {it['option_c'].strip()}")
    lines.append(f"(D) {it['option_d'].strip()}")
    lines.append("")
    lines.append(f"Correct Answer : ({it['correct_option']})")
    
    # Format explanation
    expl = it['explanation'].strip()
    expl_lines = expl.split('\n')
    if len(expl_lines) == 1:
        lines.append(f"Explanation    : {expl}")
    else:
        lines.append("Explanation    :")
        for el in expl_lines:
            lines.append(f"  {el}")
    lines.append("================================================================================\n")

txt_content = '\n'.join(lines)

out_path1 = 'batch2_type2_number_analogy_verified.txt'
with open(out_path1, 'w', encoding='utf-8') as f:
    f.write(txt_content)

out_path2 = os.path.join('public', 'batch2_type2_number_analogy_verified.txt')
os.makedirs('public', exist_ok=True)
with open(out_path2, 'w', encoding='utf-8') as f:
    f.write(txt_content)

print(f"Generated text file at {out_path1} and {out_path2} ({len(lines)} lines, {len(txt_content)} bytes).")
