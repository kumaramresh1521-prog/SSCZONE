import json

with open('type3_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    q_lines = json.load(f)

print(f"Type 3 question raw lines: {len(q_lines)}")
print("Last 10 question lines:")
for l in q_lines[-10:]:
    print(" ", l)

with open('type3_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    e_lines = json.load(f)

print(f"\nType 3 explanation raw lines: {len(e_lines)}")
print("Last 10 explanation lines:")
for l in e_lines[-10:]:
    print(" ", l)
