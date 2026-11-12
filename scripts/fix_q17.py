import json

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

by_num[17]['explanation'] = """63 : 36 :: ? : ?
Logic: Digits of the first number are reversed to get the second number.
63 reversed = 36

Similarly,
In Option (A): 94 : 49
94 reversed = 49
Hence, correct option is (A)."""

with open('kiran_type2_307_verified.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Q17 typo fixed successfully!")
