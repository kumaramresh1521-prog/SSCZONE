import json

with open("scripts/parajumbles_68_prepared.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx in [37, 38, 54, 62]: # 38, 39, 55, 63 (0-indexed)
    print(f"=== Q{idx+1} ===")
    print(repr(data[idx]["question_text"]))
