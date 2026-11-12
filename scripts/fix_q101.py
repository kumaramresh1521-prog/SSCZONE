import json

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

by_num[101]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following set. (28, 50, 94)'
by_num[101]['option_a'] = '(22, 37, 67)'
by_num[101]['option_b'] = '(41, 77, 149)'
by_num[101]['option_c'] = '(19, 40, 82)'
by_num[101]['option_d'] = '(36, 66, 126)'
by_num[101]['explanation'] = """Given set: (28, 50, 94)
Logic: First Number + 22 = Second Number; Second Number + 44 = Third Number (difference doubles: 22 × 2 = 44)
28 + 22 = 50
50 + 44 = 94

Similarly,
In Option (D): (36, 66, 126)
36 + 30 = 66
66 + 60 = 126 (difference doubles: 30 × 2 = 60)
Hence, correct option is (D)."""

with open('kiran_type2_307_verified.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Q101 updated successfully!")
