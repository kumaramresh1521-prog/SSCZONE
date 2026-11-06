import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r"C:\Users\Admin\Downloads\ssc-cgl-2025-12-september-2025-shift-3_bulk_import.json"
with open(json_path, "r", encoding="utf-8") as f:
    qs = json.load(f)

print(f"Total questions: {len(qs)}")

suspicious = []
for q in qs:
    q_num = q["question_number"]
    text = q.get("question_text", "")
    opts = [q.get("option_a", ""), q.get("option_b", ""), q.get("option_c", ""), q.get("option_d", "")]
    ans = q.get("correct_answer", "")

    # Check for empty options
    empty_opts = [idx for idx, o in enumerate(opts) if not o or o.strip() == ""]
    if empty_opts:
        suspicious.append((q_num, f"Empty options: {empty_opts}"))

    # Check for very short question text
    if len(text.strip()) < 10:
        suspicious.append((q_num, f"Very short question text: '{text}'"))

    # Check for non-standard answer
    if ans not in ["A", "B", "C", "D"]:
        suspicious.append((q_num, f"Invalid answer key: '{ans}'"))

    # Check for placeholder question marks
    if "???" in text:
        suspicious.append((q_num, "Question marks '???' found"))

print(f"Found {len(suspicious)} suspicious issues:")
for s in suspicious:
    print(f"  Q{s[0]}: {s[1]}")

print("\n--- SAMPLE QUANT QUESTIONS (Q51-Q60) ---")
for q in qs[50:60]:
    print(f"\n[Q{q['question_number']}] {q['question_text']}")
    print(f"  A: {q['option_a']}")
    print(f"  B: {q['option_b']}")
    print(f"  C: {q['option_c']}")
    print(f"  D: {q['option_d']}")
    print(f"  Ans: {q['correct_answer']}")
