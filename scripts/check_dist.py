import json

with open(r'c:\ssczone\scripts\paper_inputs\paper_34.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions loaded: {len(questions)}")
print(f"Paper ID: {questions[0].get('paper_id')}")

ans_dist = {}
for q in questions:
    ans = q.get('correct_answer')
    ans_dist[ans] = ans_dist.get(ans, 0) + 1

print(f"Answer distribution in paper_34: {ans_dist}")
