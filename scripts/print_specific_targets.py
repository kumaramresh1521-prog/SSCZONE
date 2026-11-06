import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_cleaned_database_payload.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

def get_q(pid, qnum):
    p = next(item for item in papers_data if item["paper"]["id"] == pid)
    return next(item for item in p["questions"] if item["question_number"] == qnum)

items_to_check = [
    (5, 13, "Paper 5 Q13 (P9@ / Q10_)"),
    (5, 74, "Paper 5 Q74 (Cylindrical vessel / र्ध्वाेर्तेैे)"),
    (6, 23, "Paper 6 Q23 (दो पुत्रो)"),
    (7, 14, "Paper 7 Q14 (क्ति M)"),
    (8, 23, "Paper 8 Q23 (|| in statement)"),
    (9, 35, "Paper 9 Q35 (मेंि यों र्णेहैं)"),
    (9, 63, "Paper 9 Q63 (की मेंि हानि)"),
    (10, 41, "Paper 10 Q41 (मेंि A)"),
    (11, 14, "Paper 11 Q14 (निर्रुतर)"),
    (11, 69, "Paper 11 Q69 (Missing angle)"),
    (11, 72, "Paper 11 Q72 (Missing equation)"),
    (12, 35, "Paper 12 Q35 (परन्तु असत्य)"),
    (13, 23, "Paper 13 Q23 (e×pressions)")
]

for pid, qnum, label in items_to_check:
    q = get_q(pid, qnum)
    print(f"\n=======================================================")
    print(f"{label}:")
    print(f"Q_TEXT: {q['question_text']}")
    print(f"OP_A: {q['option_a']}")
    print(f"OP_B: {q['option_b']}")
    print(f"OP_C: {q['option_c']}")
    print(f"OP_D: {q['option_d']}")
    print(f"ANS:  {q['correct_answer']}")
