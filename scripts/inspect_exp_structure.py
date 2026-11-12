import json

with open('type2_parsed_explanations.json', 'r', encoding='utf-8') as f:
    raw_exp = json.load(f)

print("Type of raw_exp:", type(raw_exp))
if isinstance(raw_exp, dict):
    print("Keys sample:", list(raw_exp.keys())[:10])
    first_key = list(raw_exp.keys())[0]
    print(f"Sample [{first_key}]:", raw_exp[first_key])
elif isinstance(raw_exp, list):
    print("List len:", len(raw_exp))
    print("Sample [0]:", raw_exp[0])
