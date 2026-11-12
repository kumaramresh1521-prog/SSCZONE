import json
import re

def sort_page_items(items):
    # Sort by 3 columns: col 0 (<140), col 1 (140-270), col 2 (>=270)
    # Then by y coordinate
    def sort_key(item):
        x = item[0][0][0]
        y = item[0][0][1]
        col = 0 if x < 140 else (1 if x < 270 else 2)
        return (col, y)
    
    return sorted(items, key=sort_key)

# Let's test on p31 right and p32 left
with open('scripts/pdf_samples/t4_robust/q_p31_right.json', 'r', encoding='utf-8') as f:
    items_p31 = json.load(f)

sorted_p31 = sort_page_items(items_p31)

print("=== FIRST 40 LINES FROM SORTED P31 RIGHT ===")
for b, t, s in sorted_p31[:40]:
    print(t)
