import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end = int(sys.argv[2]) if len(sys.argv) > 2 else 10

with open('scripts/dupes_extracted_64.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for i in range(start, min(end, len(items))):
    it = items[i]
    print(f"\n=== {i+1:02d}. {it['base']} Q.{it['qn']} [Ans: {it['ans']}] ===")
    print("Current: " + it['current'])
    print("PDF extract:")
    for l in it['pdf_extract'].split('\n')[:18]:
        if l.strip():
            print("   " + l.strip())
