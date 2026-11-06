import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_all_corrections_log.json", "r", encoding="utf-8") as f:
    d = json.load(f)

for pid, p in d.items():
    print(f"\n### Paper ID {int(pid)}: {p['title']}")
    print(f"**Total Questions Corrected:** {p['count']}")
    print("| Question | Field | Typo Found (अशुद्धि) | Corrected To (सुधार) |")
    print("| :--- | :--- | :--- | :--- |")
    for u in p["updates"]:
        qnum = u["qnum"]
        for log in u["logs"]:
            # parse '[question_text] 'विकल्पो' -> 'विकल्पों''
            field = log.split("]")[0].replace("[", "")
            action = log.split("]")[1].strip()
            if " -> " in action:
                parts = action.split(" -> ")
                wrong = parts[0].replace("'", "")
                right = parts[1].replace("'", "")
                print(f"| **Q{qnum}** | `{field}` | `{wrong}` | `{right}` |")
            else:
                print(f"| **Q{qnum}** | `{field}` | `{action}` | *Removed / Spaced* |")
