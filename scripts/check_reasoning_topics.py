import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r"c:\ssczone\src\data\pyq_backup\ssc-cgl-2025-12-september-2025-shift-3.json"
with open(json_path, "r", encoding="utf-8") as f:
    qs = json.load(f)

for q in qs[:25]:
    print(f"Q{q['question_number']}: {q['question_text'][:90]}...")
