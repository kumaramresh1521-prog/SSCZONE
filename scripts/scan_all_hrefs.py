import os
import re

hrefs = set()
dynamic_links = []

for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.tsx', '.ts', '.jsx', '.js')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                # Find Link href and router.push
                for m in re.finditer(r'href=\{?([`\'"][^`\'"}]*[`\'"])\}?', content):
                    raw = m.group(1).strip('`\'"')
                    if raw.startswith('/'):
                        dynamic_links.append((p, raw))
                        hrefs.add(raw)
                for m in re.finditer(r'router\.push\(\{?([`\'"][^`\'"}]*[`\'"])\}?', content):
                    raw = m.group(1).strip('`\'"')
                    if raw.startswith('/'):
                        dynamic_links.append((p, raw))
                        hrefs.add(raw)

print(f"Total dynamic links found: {len(dynamic_links)}")
print(f"Total unique href patterns: {len(hrefs)}")

print("\n--- Key URL Patterns in Website ---")
for h in sorted(hrefs):
    if any(k in h for k in ['take-test', 'practice', 'papers', 'question', 'exam', 'quiz', 'notes', 'books', 'syllabus', 'mocks', 'daily-quiz']):
        print(h)
