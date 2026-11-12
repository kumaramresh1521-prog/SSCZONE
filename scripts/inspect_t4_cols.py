import json

with open('scripts/pdf_samples/t4_col_starts.json', 'r', encoding='utf-8') as f:
    cols = json.load(f)

for c in cols:
    print(f"c_idx={c['c_idx']} {c['fname']} col={c['col_no']} Q{c['q_start']}-Q{c['q_end']}")
