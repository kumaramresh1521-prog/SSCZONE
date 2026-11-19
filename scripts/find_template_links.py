import os
import re

template_links = []

for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.tsx', '.ts', '.jsx', '.js')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                # Find occurrences of `href={` or `href="` or `href='` or `router.push(`
                for line_no, line in enumerate(content.split('\n'), 1):
                    if ('href={' in line or 'href="`' in line or 'router.push(' in line or 'href={`' in line or 'getQuestionCanonicalPath' in line) and ('take-test' in line or 'practice' in line or 'paper' in line or 'topic' in line or 'question' in line):
                        template_links.append((p, line_no, line.strip()))

print(f"Total template links found: {len(template_links)}")
for path, line_no, line in template_links[:60]:
    rel_path = os.path.relpath(path, 'src')
    print(f"{rel_path}:{line_no} -> {line}")
