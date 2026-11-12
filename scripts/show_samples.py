import json, glob, sys

sys.stdout.reconfigure(encoding='utf-8')

patches = sorted(glob.glob('scripts/verified_patches/*.json'))
samples = []
for p in patches:
    with open(p, 'r', encoding='utf-8') as f:
        d = json.load(f)
    for ch in d.get('changes', []):
        reason = ch.get('reason', '')
        if len(reason) > 30 and any(k in reason for k in ['=', 'formula', 'Article', 'ratio', 'mean', 'opposite']):
            samples.append({
                'paper': d.get('paper_id'),
                'qnum': ch.get('question_number'),
                'old': ch.get('old_answer'),
                'new': ch.get('new_answer'),
                'reason': reason
            })
            if len(samples) >= 8:
                break
    if len(samples) >= 8:
        break

for s in samples:
    print(f"Paper {s['paper']} Q{s['qnum']}: Old={s['old']} -> New={s['new']}")
    print(f"  Calculation/Reason: {s['reason']}\n")
