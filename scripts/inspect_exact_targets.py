import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('tmp_cleaned_database_payload.json', 'r', encoding='utf-8') as f:
    papers = json.load(f)

targets = [
    (5, 74, "Paper 5 Q74 - Cylindrical vessel"),
    (5, 13, "Paper 5 Q13 - Q10_ : P9@ : O8$"),
    (6, 23, "Paper 6 Q23 - पुत्रो"),
    (7, 14, "Paper 7 Q14 - क्ति M"),
    (7, 63, "Paper 7 Q63 - की मेंि हानि"),
    (8, 23, "Paper 8 Q23 - ||"),
    (8, 41, "Paper 8 Q41 - मेंि A)"),
    (9, 35, "Paper 9 Q35 - मेंि यों र्णेहैं"),
    (11, 14, "Paper 11 Q14 - निर्रुतर"),
    (11, 69, "Paper 11 Q69 - central angle of radians"),
    (11, 72, "Paper 11 Q72 - Given, , what is ?"),
    (12, 20, "Paper 12 Q20 - e×pressions"),
    (12, 35, "Paper 12 Q35 - परन्तु असत्य"),
    (13, 23, "Paper 13 Q23 - e×pressions")
]

for pid, qnum, desc in targets:
    for p in papers:
        if p['paper']['id'] == pid:
            for q in p['questions']:
                if q['question_number'] == qnum:
                    print(f"=== {desc} ===")
                    print("Q:", q.get('question_text'))
                    print("A:", q.get('option_a'))
                    print("B:", q.get('option_b'))
                    print("C:", q.get('option_c'))
                    print("D:", q.get('option_d'))
                    print("Correct:", q.get('correct_option'))
                    print()
