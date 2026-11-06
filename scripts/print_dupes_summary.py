import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/all_dupes_list.json', 'r', encoding='utf-8') as f:
    dupes = json.load(f)

with open('scripts/dupes_summary_clean.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total dupes to fix: {len(dupes)}\n\n")
    for i, d in enumerate(dupes):
        out.write(f"{i+1:02d}. {d['base']} Q.{d['qn']} [Ans: {d['ans']}]\n")
        out.write(f"    Q: {d['question_text'][:90]}...\n")
        out.write(f"    A: {d['options'][0]}\n")
        out.write(f"    B: {d['options'][1]}\n")
        out.write(f"    C: {d['options'][2]}\n")
        out.write(f"    D: {d['options'][3]}\n\n")

