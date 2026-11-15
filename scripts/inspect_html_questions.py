import re, json

with open(r"f:\startup  send mail\2026\ssc_parajumbles_cbt.html", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

m = re.search(r'const\s+E\s*=\s*\[([\s\S]*?)\];', text)
if m:
    # Use regex to extract all string items
    expls = re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))
    print(f"Total explanations found in E: {len(expls)}")
    for i in range(min(5, len(expls))):
        print(f"E{i+1}: {expls[i]}")
    if expls:
        print(f"Last E{len(expls)}: {expls[-1]}")
else:
    print("Could not find const E")
