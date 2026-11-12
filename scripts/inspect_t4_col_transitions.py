import json
import os

with open('scripts/pdf_samples/t4_clean_stream.json', 'r', encoding='utf-8') as f:
    cols = json.load(f)['cols']

# Print bottom 5 and top 5 lines of every column boundary, plus any dy > 13.5 within any column
print("=== COLUMN BOUNDARIES (Bottom 5 -> Top 5) ===")
for i in range(len(cols)):
    c = cols[i]
    lns = c['lines']
    print(f"\n--- Col {i} ({c['name']}, {len(lns)} lines, y={lns[0]['y']}..{lns[-1]['y']}) ---")
    print("  TOP 4:")
    for ln in lns[:4]:
        print(f"    y={ln['y']:5.1f} | {ln['text']}")
    print("  BOT 4:")
    for ln in lns[-4:]:
        print(f"    y={ln['y']:5.1f} | {ln['text']}")

print("\n=== ALL INTRACOLUMN GAPS (dy > 13.5) ===")
for i, c in enumerate(cols):
    lns = c['lines']
    for k in range(len(lns) - 1):
        dy = lns[k+1]['y'] - lns[k]['y']
        if dy > 13.5:
            print(f"  Col {i} ({c['name']}) dy={dy:.1f}: y={lns[k]['y']} {lns[k]['text']!r} -> y={lns[k+1]['y']} {lns[k+1]['text']!r}")
