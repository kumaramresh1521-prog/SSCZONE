import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_final_corrections.json", "r", encoding="utf-8") as f:
    reports = json.load(f)

for pid, d in reports.items():
    print(f"\n================================================================================")
    print(f"PAPER ID {int(pid):2d}: {d['title']} ({d['count']} Questions Corrected)")
    print(f"================================================================================")
    for q in d["questions"]:
        qnum = q["qnum"]
        print(f"  • Q{qnum}:")
        for chg in q["changes"]:
            print(f"    - Field: {chg['field']}")
            print(f"      Matched: {chg['matches']}")
            print(f"      Action:  {chg['desc']}")
