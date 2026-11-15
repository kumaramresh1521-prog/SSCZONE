import os
import re

matches = []
for root, dirs, files in os.walk('src'):
    if 'node_modules' in root or '.next' in root:
        continue
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx'):
            path = os.path.join(root, f)
            try:
                content = open(path, encoding='utf-8').read()
                # Find supabase table select queries
                for m in re.finditer(r'\.from\((["\'])(.*?)\1\)\s*\.select\((["\'])(.*?)\3\)', content):
                    tbl = m.group(2)
                    sel = m.group(4)
                    matches.append((path, tbl, sel))
            except Exception:
                pass

print(f"Total Supabase SELECT queries found: {len(matches)}")
table_counts = {}
for p, t, s in matches:
    table_counts[t] = table_counts.get(t, 0) + 1

for t, c in sorted(table_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"Table '{t}': {c} select calls")

print("\n--- Queries with select('*') ---")
star_queries = [m for m in matches if m[2] == '*' or '*' in m[2]]
print(f"Total select('*') queries: {len(star_queries)}")
for p, t, s in star_queries:
    print(f"  {p} -> {t}")
