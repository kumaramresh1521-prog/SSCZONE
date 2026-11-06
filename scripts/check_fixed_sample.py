import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

env = dict(l.strip().split('=', 1) for l in open('.env.local') if '=' in l and not l.startswith('#'))
headers = {'apikey': env['SUPABASE_SERVICE_ROLE_KEY'], 'Authorization': 'Bearer ' + env['SUPABASE_SERVICE_ROLE_KEY']}

samples = [
    (27, 2, "1 Oct S1 Q.2"),
    (27, 57, "1 Oct S1 Q.57"),
    (25, 70, "30 Sep S2 Q.70"),
    (26, 70, "30 Sep S3 Q.70"),
    (38, 53, "7 Oct S3 Q.53"),
    (40, 19, "8 Oct S2 Q.19"),
    (44, 90, "9 Oct S3 Q.90"),
    (6, 68, "2025 13 Sep S1 Q.68"),
    (7, 66, "2025 13 Sep S2 Q.66"),
    (19, 62, "2025 17 Sep S2 Q.62")
]

for pid, qn, label in samples:
    url = f"{env['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1/paper_questions?paper_id=eq.{pid}&question_number=eq.{qn}&select=question_number,question_text,option_a,option_b,option_c,option_d,correct_answer"
    r = requests.get(url, headers=headers)
    items = r.json()
    if items:
        q = items[0]
        print(f"=== {label} [Ans: {q['correct_answer']}] ===")
        print(f"Q: {q['question_text'][:80]}...")
        print(f"A: {q['option_a']}")
        print(f"B: {q['option_b']}")
        print(f"C: {q['option_c']}")
        print(f"D: {q['option_d']}\n")
