import json

with open('scripts/pdf_samples/t4_compiled_draft.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

incomplete_opts = []
for q in questions:
    qn = q['q_num']
    opts = q['options']
    empty_indices = [i for i, opt in enumerate(opts) if not opt or len(opt.strip()) == 0]
    if empty_indices:
        incomplete_opts.append((qn, empty_indices, opts, q['question_text']))

print(f"Total questions: {len(questions)}")
print(f"Questions with incomplete options: {len(incomplete_opts)} / 254")
for qn, emp, opts, p in incomplete_opts[:20]:
    print(f"Q{qn}: missing options at indices {emp} -> current opts: {opts}")
    print(f"   Prompt: {p[:60]}")
