import json
from collections import Counter
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_real_typos_found.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for pid, d in data.items():
    print(f"\n==================================================")
    print(f"Paper {pid}: {d['title']}")
    # Count by desc
    counts = Counter(item['desc'] for item in d['items'])
    for desc, cnt in counts.most_common(12):
        print(f"  {desc}: {cnt}")
        # print 1-2 examples
        sample = next(item for item in d['items'] if item['desc'] == desc)
        print(f"    e.g. matched: '{sample['matched']}' in Q{sample['qnum']} ({sample['field']}) -> Context: {sample['context'].strip()}")
