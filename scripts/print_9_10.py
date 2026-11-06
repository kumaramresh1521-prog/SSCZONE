import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_cleaned_database_payload.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

def get_q(pid, qnum):
    p = next(item for item in papers_data if item["paper"]["id"] == pid)
    return next(item for item in p["questions"] if item["question_number"] == qnum)

for pid, qnum in [(9, 35), (9, 63), (10, 41)]:
    q = get_q(pid, qnum)
    print(f"\nPaper {pid} Q{qnum}:")
    print(q["question_text"])
