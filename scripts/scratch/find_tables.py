import re

with open(r"c:\ssczone\src\app\take-test\[paperId]\page.tsx", encoding="utf-8") as f:
    text = f.read()

tables = set(re.findall(r'from\(["\']([a-zA-Z0-9_]+)["\']\)', text))
print("Tables in take-test:", tables)

# Also check how paper is fetched
for line in text.splitlines():
    if "from(" in line:
        print(" ", line.strip()[:100])
