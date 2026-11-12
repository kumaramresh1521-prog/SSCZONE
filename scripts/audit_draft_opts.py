import json

with open('scripts/pdf_samples/t4_compiled_draft.json', 'r', encoding='utf-8') as f:
    draft = json.load(f)

incomplete = []
for q in draft:
    opts = q['options']
    empty_indices = [i for i, o in enumerate(opts) if not o or len(o.strip()) == 0]
    if empty_indices:
        incomplete.append((q['q_num'], empty_indices, opts, q['question_text']))

print(f"Total incomplete in draft: {len(incomplete)} / {len(draft)}")
for qn, emp, opts, txt in incomplete[:15]:
    print(f"Q{qn}: missing {emp} -> {opts} | {txt[:50]}")
