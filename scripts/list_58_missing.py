import json

with open('scripts/pdf_samples/t4_incomplete_options.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"58 question numbers: {[it['q_num'] for it in items]}")
for it in items:
    opts = it['opts']
    missing_opts = [i for i in [1, 2, 3, 4] if not opts.get(str(i)) and not opts.get(i)]
    print(f"Q{it['q_num']}: missing {missing_opts} | prompt={it['chunk'][0][:45]}")
