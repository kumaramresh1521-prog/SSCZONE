import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_detected_issues.json", "r", encoding="utf-8") as f:
    paper_issues = json.load(f)

for pid, d in paper_issues.items():
    print(f"\n==================================================")
    print(f"PAPER ID {pid}: {d['title']}")
    print(f"==================================================")
    
    # Group issues by question
    by_q = {}
    for issue in d["issues"]:
        qnum = issue["qnum"]
        if qnum not in by_q:
            by_q[qnum] = []
        by_q[qnum].append(issue)
        
    for qnum in sorted(by_q.keys())[:10]: # Print first 10 questions with issues
        q_issues = by_q[qnum]
        print(f"  Q{qnum}:")
        for iss in q_issues:
            print(f"    - [{iss['type']}] Field: {iss['field']} | Found: {iss['wrong']} -> {iss.get('correct', '')}")
            print(f"      Snippet: {iss['snippet']}")
