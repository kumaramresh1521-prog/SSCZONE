import json

qs = json.load(open('type2_questions_raw.json', encoding='utf-8'))
for q in [126, 192, 193, 195]:
    item = qs[q-1]
    print(f"=== Q{q} ===")
    print("Text:", item['question_text'])
    print(f"Opts: A) {item['option_a']} | B) {item['option_b']} | C) {item['option_c']} | D) {item['option_d']}")
    print("Exam:", item['exam_tag'])
