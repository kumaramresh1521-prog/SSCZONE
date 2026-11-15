import re

with open(r"f:\startup  send mail\2026\ssc_parajumbles_cbt.html", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Look at script where D.forEach or render is called
idx = text.find("const D=[")
if idx != -1:
    print(text[idx+len(text[idx:]):idx+5000]) # wait, print next 3000 chars after D.push
    
# Let's search for .dir in the script
for m in re.finditer(r'.{0,50}dir.{0,100}', text):
    print("DIR MATCH:", m.group(0))
