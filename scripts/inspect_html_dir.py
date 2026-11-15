import re

with open(r"f:\startup  send mail\2026\ssc_parajumbles_cbt.html", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Look at script section where questions and directions are defined
script_matches = re.findall(r'<script.*?</script>', text, re.DOTALL)
for s in script_matches:
    print("Script length:", len(s))
    # print lines that mention dir, q(, E=, etc.
    lines = s.split("\n")
    for line in lines[:60]:
        if any(k in line for k in ["dir", "function", "const", "var", "let", "q("]):
            print(line[:120])
