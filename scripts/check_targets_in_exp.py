import json

with open('type4_explanations_parsed.json', 'r', encoding='utf-8') as f:
    exps = json.load(f)

targets = [39, 62, 69, 101, 108, 136, 137, 150, 153, 166, 169, 170, 171, 172, 176, 184, 188, 192, 193, 195, 204, 212, 224, 228, 244, 249, 253]

found_in_exp = {}
for t in targets:
    if str(t) in exps:
        found_in_exp[t] = exps[str(t)]

print(f"Found in exps: {len(found_in_exp)} / {len(targets)}")
for t, val in found_in_exp.items():
    print(f"Q{t}: ans={val.get('ans')} | text={val.get('text')[:60]}")
