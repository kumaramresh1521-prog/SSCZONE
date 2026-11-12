import os
import json
import glob

backup_dir = r'c:\ssczone\src\data\pyq_backup'
files = glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json'))
print(f"Total 2026 JSON files: {len(files)}")

results = []
for f in sorted(files):
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    if isinstance(data, list):
        questions = data
        paper = {'slug': os.path.basename(f)}
    else:
        paper = data.get('paper', {})
        questions = data.get('questions', [])
    ans_counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'Other': 0}
    for q in questions:
        ans = (q.get('correct_answer') or '').strip().upper()
        if ans in ans_counts:
            ans_counts[ans] += 1
        else:
            ans_counts['Other'] += 1
    total = len(questions)
    results.append({
        'slug': paper.get('slug', os.path.basename(f)),
        'total': total,
        'counts': ans_counts,
        'pct_A': round((ans_counts['A'] / total) * 100, 1) if total else 0
    })

print(f"{'Slug':<48} | {'Tot':<4} | {'A':<4} | {'B':<4} | {'C':<4} | {'D':<4} | {'% A':<6}")
print("-" * 80)
for r in results:
    c = r['counts']
    print(f"{r['slug']:<48} | {r['total']:<4} | {c['A']:<4} | {c['B']:<4} | {c['C']:<4} | {c['D']:<4} | {r['pct_A']}%")
