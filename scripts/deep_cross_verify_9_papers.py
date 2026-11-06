import fitz
import re
import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

folder = r"F:\startup  send mail"
pdf_files = [f for f in sorted(os.listdir(folder)) if f.lower().endswith(".pdf")]

with open("tmp_9_papers_pure_english.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

print("=" * 80)
print("DEEP CROSS-VERIFICATION OF ALL 900 QUESTIONS (9 PAPERS)")
print("=" * 80)

flagged_items = []

for p, fname in zip(papers, pdf_files):
    pid = p["paper_id"]
    title = p["title"]
    qs = p["questions"]
    pdf_path = os.path.join(folder, fname)
    doc = fitz.open(pdf_path)

    # Check 1: Truncated or very short question text
    for q in qs:
        qn = q["question_number"]
        txt = q["question_text"]
        opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
        ans = q["correct_answer"]
        
        # 1. Truncated statement checks
        if len(txt.strip()) < 15:
            flagged_items.append({
                "paper": title,
                "pid": pid,
                "qnum": qn,
                "type": "Very Short Statement",
                "details": f"Text: '{txt}'",
                "obj": q
            })
            
        # 2. Check if text ends abruptly with words like "of", "the", "in", "and", "is", "a"
        last_word = txt.split()[-1].lower().rstrip('?:.,!') if txt.split() else ""
        if last_word in ["of", "the", "in", "and", "is", "that", "which", "with", "for", "to"]:
            flagged_items.append({
                "paper": title,
                "pid": pid,
                "qnum": qn,
                "type": "Statement ends abruptly",
                "details": f"Ends with '{last_word}': '{txt}'",
                "obj": q
            })

        # 3. Check for placeholder options like "Option A", "Option B"
        for lbl, o_val in zip(["A", "B", "C", "D"], opts):
            if o_val == f"Option {lbl}":
                flagged_items.append({
                    "paper": title,
                    "pid": pid,
                    "qnum": qn,
                    "type": "Placeholder Option",
                    "details": f"Option {lbl} is '{o_val}'",
                    "obj": q
                })
                
        # 4. Check for double spaces or unclosed quotes/brackets
        if txt.count('(') != txt.count(')'):
            flagged_items.append({
                "paper": title,
                "pid": pid,
                "qnum": qn,
                "type": "Mismatched Parentheses",
                "details": f"Parentheses count mismatch: '{txt}'",
                "obj": q
            })

        # 5. Check if answer is missing
        if ans not in ["A", "B", "C", "D"]:
            flagged_items.append({
                "paper": title,
                "pid": pid,
                "qnum": qn,
                "type": "Invalid Answer",
                "details": f"Answer is '{ans}'",
                "obj": q
            })

print(f"Total flagged items across all 900 questions: {len(flagged_items)}\n")

for item in flagged_items:
    print(f"[{item['type']}] {item['paper']} Q{item['qnum']}: {item['details']}")
