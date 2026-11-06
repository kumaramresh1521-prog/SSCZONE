import json, sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-12-october-2026-shift-3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for q in data:
    if q['question_number'] in range(96, 101):
        print(f"=== Q.{q['question_number']} ===")
        print(f"QT: {q['question_text']}")
        print(f"A: {q['option_a']}")
        print(f"B: {q['option_b']}")
        print(f"C: {q['option_c']}")
        print(f"D: {q['option_d']}")
        print(f"ANS: {q['correct_answer']}")
