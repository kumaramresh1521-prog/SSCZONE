import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_papers_data.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

# Let's inspect papers 4, 6, 10, 11, 13 specifically to find any additional typos
target_pids = [4, 6, 10, 11, 13]

for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    if pid not in target_pids:
        continue
    qs = p_item["questions"]
    print(f"\n=======================================================")
    print(f"Scanning Paper {pid}: {p['title']}")
    
    for q in qs:
        qnum = q["question_number"]
        if qnum > 75:
            continue
        text = q["question_text"]
        
        # Check for unspaced punctuation
        if re.search(r'[।?][a-zA-Z\u0900-\u097F]', text):
            print(f"  Q{qnum}: Missing space after punctuation -> {re.findall(r'.{0,15}[।?][a-zA-Z\u0900-\u097F].{0,15}', text)}")
            
        # Check for words ending in strange combinations
        weird_words = re.findall(r'\b[\u0900-\u097F]{2,}(?:मेंसे|काएक|कीएक|मेंएक|केलिए|केद्वारा|केअनुसार)\b', text)
        if weird_words:
            print(f"  Q{qnum}: Merged postposition -> {weird_words}")
            
        # Check for digits directly adjacent to Hindi letters without space e.g. 5वाँ, 10वीं, 12th
        adj_digits = re.findall(r'\d+[a-zA-Z\u0900-\u097F]+', text)
        clean_adj = [a for a in adj_digits if not a.endswith("वाँ") and not a.endswith("वीं") and not a.endswith("वें") and not a.endswith("th") and not a.endswith("st") and not a.endswith("nd") and not a.endswith("rd")]
        if clean_adj:
            print(f"  Q{qnum}: Digit adjacent to text -> {clean_adj}")

        # Check options for attached symbols or typos
        for opt_lbl, opt_val in [("A", q["option_a"]), ("B", q["option_b"]), ("C", q["option_c"]), ("D", q["option_d"])]:
            if not opt_val: continue
            if "उपरोक्त" in opt_val or "संबधित" in opt_val or "नही" in opt_val.split():
                print(f"  Q{qnum} Opt {opt_lbl}: Typo in option -> {opt_val}")
