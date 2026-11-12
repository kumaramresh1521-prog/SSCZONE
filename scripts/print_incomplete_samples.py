import json

with open('scripts/pdf_samples/t4_incomplete_options.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for it in items[:15]:
    qn = it['q_num']
    opts = it['opts']
    ch = it['chunk']
    print(f"=== Q{qn} ===")
    print(f"  Prompt: {ch[0]}")
    print(f"  Opts: {opts}")
    print(f"  Lines: {ch}")
