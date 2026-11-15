import urllib.request, json
from collections import Counter

endpoints = [
    ("Random/Mixed 25Q", "http://localhost:3000/api/speed-test/questions?mode=random&subject=all&count=25"),
    ("Quant Subject 25Q", "http://localhost:3000/api/speed-test/questions?mode=subject&subject=quant&count=25"),
    ("Reasoning Subject 25Q", "http://localhost:3000/api/speed-test/questions?mode=subject&subject=reasoning&count=25"),
    ("GA Subject 25Q", "http://localhost:3000/api/speed-test/questions?mode=subject&subject=ga&count=25"),
    ("English Subject 25Q", "http://localhost:3000/api/speed-test/questions?mode=subject&subject=english&count=25"),
]

for label, url in endpoints:
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            questions = data.get("questions", [])
            sources = Counter(q["source"] for q in questions)
            sections = Counter(q["subjectKey"] for q in questions)
            print(f"\n=== {label} ===")
            print(f"Total count: {len(questions)}")
            print(f"Sources: {dict(sources)}")
            print(f"Section distribution: {dict(sections)}")
            if questions:
                print(f"Sample Q1 [{questions[0]['source'].upper()} - {questions[0]['subject']}]: {repr(questions[0]['question_text'][:70])}")
    except Exception as e:
        print(f"Error testing {label}: {e}")
