import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_9_papers_pure_english.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

total_devanagari_instances = 0
total_empty_opts = 0
total_short_qs = 0
total_valid_answers = 0

print("=" * 80)
print("AUDIT REPORT: 9 NEW PAPERS EXTRACTED IN PURE ENGLISH")
print("=" * 80)

for p in papers:
    pid = p["paper_id"]
    title = p["title"]
    qs = p["questions"]
    
    p_devanagari = 0
    p_short_qs = []
    p_empty_opts = []
    p_invalid_ans = []
    
    for q in qs:
        qnum = q["question_number"]
        txt = q["question_text"]
        opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
        ans = q["correct_answer"]
        
        # Check devanagari in text or options
        all_text = f"{txt} {' '.join(opts)}"
        dev_matches = re.findall(r'[\u0900-\u097F]', all_text)
        if dev_matches:
            p_devanagari += len(dev_matches)
            
        if len(txt) < 15:
            p_short_qs.append((qnum, txt))
            
        for o_lbl, o_val in zip(["A", "B", "C", "D"], opts):
            if not o_val or o_val.strip() == "":
                p_empty_opts.append((qnum, o_lbl))
                
        if ans not in ["A", "B", "C", "D"]:
            p_invalid_ans.append((qnum, ans))
            
    print(f"\n📄 {title} (ID {pid}):")
    print(f"   • Questions: {len(qs)}/100")
    print(f"   • Devanagari (Hindi) Chars Found: {p_devanagari}")
    print(f"   • Short Question Texts (<15 chars): {len(p_short_qs)}")
    if p_short_qs:
        for sq in p_short_qs[:5]:
            print(f"       Q{sq[0]}: '{sq[1]}'")
    print(f"   • Empty Options: {len(p_empty_opts)}")
    print(f"   • Invalid Answers: {len(p_invalid_ans)}")

print("\n" + "=" * 80)
