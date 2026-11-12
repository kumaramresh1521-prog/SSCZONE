import json

with open('type4_explanations_parsed.json', 'r', encoding='utf-8') as f:
    exps = json.load(f)

for q in [8, 12, 13, 14, 16, 17, 18, 19, 20, 22]:
    if str(q) in exps:
        print(f"Q{q}: ans={exps[str(q)]['ans']} | {exps[str(q)]['text'][:100]}")
    else:
        print(f"Q{q}: NOT in parsed exps!")
