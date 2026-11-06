import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r"C:\Users\Admin\Downloads\ssc-cgl-2025-12-september-2025-shift-3_bulk_import.json"
with open(json_path, "r", encoding="utf-8") as f:
    qs = json.load(f)

for target in [11, 13, 51, 53, 56, 57, 75, 90]:
    q = qs[target - 1]
    print(f"\n==================== Q{target} ====================")
    print("TEXT:", q["question_text"])
    print("A:", q["option_a"])
    print("B:", q["option_b"])
    print("C:", q["option_c"])
    print("D:", q["option_d"])
    print("ANS:", q["correct_answer"])
