import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_cleaned_database_payload.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

targets = [
    (1, [50, 74]),
    (4, [41]),
    (6, [13, 23]),
    (7, [14]),
    (8, [23]),
    (9, [35, 63]),
    (10, [41]),
    (11, [14, 69, 72]),
    (12, [4, 35])
]

for pid, qnums in targets:
    p_item = next(p for p in papers_data if p["paper"]["id"] == pid)
    print(f"\n================================================================================")
    print(f"Paper {pid}: {p_item['paper']['title']}")
    for qnum in qnums:
        q = next(item for item in p_item["questions"] if item["question_number"] == qnum)
        print(f"\n--- Q{qnum} ---")
        print(f"Question Text: {q['question_text']}")
        print(f"A: {q['option_a']}")
        print(f"B: {q['option_b']}")
        print(f"C: {q['option_c']}")
        print(f"D: {q['option_d']}")
        print(f"Ans: {q['correct_answer']}")
        if q.get('explanation'):
            print(f"Explanation: {q['explanation']}")
