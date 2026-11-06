import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')
resp = requests.get('http://localhost:3000/api/papers/questions?paperId=50')
result = resp.json()
data = result['questions']
print(f'Total questions: {len(data)}')
target = [11,14,25,29,30,31,36,37,44,55,61,62,83,88,93]
for q in sorted(data, key=lambda x: x.get('question_number',0)):
    qn = q.get('question_number')
    if qn in target:
        qt = q['question_text']
        print(f'Q.{qn}: {qt[:90]}')
        print(f'  A={q["option_a"][:60]}')
        print(f'  B={q["option_b"][:60]}')
        print(f'  C={q["option_c"][:60]}')
        print(f'  D={q["option_d"][:60]}')
        print(f'  ANS={q["correct_answer"]}')
        print()
