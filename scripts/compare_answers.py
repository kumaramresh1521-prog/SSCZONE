import json

with open('type1_answers_final.json', 'r', encoding='utf-8') as f:
    old_ans = json.load(f)

with open('parsed_284_explanations.json', 'r', encoding='utf-8') as f:
    expl_data = json.load(f)

letter_map = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}

mismatches = []
for q_str, it in expl_data.items():
    q = int(q_str)
    expl_digit = it['ans_digit']
    expl_letter = letter_map[expl_digit]
    old_letter = old_ans.get(str(q))
    
    if old_letter != expl_letter:
        mismatches.append((q, old_letter, expl_letter, it['explanation'][:70]))

print(f"Total mismatches between old OCR answer table and explanation headers: {len(mismatches)}")
for q, old, expl, txt in mismatches:
    print(f"Q{q}: old_ans={old} vs expl_ans={expl} | Exp: {txt}")
