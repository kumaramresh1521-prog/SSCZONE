import json
import glob

for f in sorted(glob.glob('scripts/pdf_samples/t4_robust/exp_p*.json')):
    with open(f, 'r', encoding='utf-8') as fp:
        items = json.load(fp)
    for it in items:
        if '167' in it[1]:
            print(f"{f}: {it[1]}")
