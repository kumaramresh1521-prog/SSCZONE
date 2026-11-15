import urllib.request, re

with urllib.request.urlopen("http://localhost:3000/exams/ssc-cgl") as response:
    html = response.read().decode("utf-8", errors="ignore")

scripts = re.findall(r'src="(/_next/static/[^"]+)"', html)
print(f"Found {len(scripts)} scripts")

for s in scripts:
    try:
        url = "http://localhost:3000" + s
        with urllib.request.urlopen(url) as js_res:
            js = js_res.read().decode("utf-8", errors="ignore")
            if "View List" in js or "openSubjects" in js:
                print(f"Found in script: {s}")
                for m in re.finditer(r".{0,60}(?:View List|openSubjects|idx\s*===\s*0|initialState).{0,60}", js):
                    print("   -->", m.group(0))
    except Exception as e:
        pass
