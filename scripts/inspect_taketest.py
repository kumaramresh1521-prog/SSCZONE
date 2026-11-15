content = open('src/app/take-test/[paperId]/page.tsx', encoding='utf-8').read()
import re
for m in re.finditer(r'\.from\((["\'])(.*?)\1\)', content):
    start = max(0, m.start() - 30)
    end = min(len(content), m.end() + 100)
    print(content[start:end].replace('\n', ' '))
    print('---')
