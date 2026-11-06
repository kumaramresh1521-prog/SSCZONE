import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r"c:\ssczone\src\data\pyq_backup\ssc-cgl-2025-12-september-2025-shift-3.json"
with open(json_path, "r", encoding="utf-8") as f:
    qs = json.load(f)

targets = [10, 21, 26, 33, 44, 53, 56, 57, 61, 75, 85, 88]

for t in targets:
    q = qs[t - 1]
    print(f"\n====================== Q{t} ======================")
    print("TEXT:", q.get("question_text"))
    print("A:", q.get("option_a"))
    print("B:", q.get("option_b"))
    print("C:", q.get("option_c"))
    print("D:", q.get("option_d"))
    print("ANS:", q.get("correct_answer"))
    if q.get("explanation"):
        print("EXP:", q.get("explanation"))
