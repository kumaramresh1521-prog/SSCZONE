import json

with open('scripts/pdf_samples/t4_compiled_draft.json', 'r', encoding='utf-8') as f:
    draft = json.load(f)

print(f"Total questions in draft: {len(draft)}")
short_prompts = [q for q in draft if len(q['question_text']) < 15]
print(f"Short prompts: {len(short_prompts)}")
for q in draft[:5]:
    print(f"Q{q['q_num']}: {q['question_text']}")
