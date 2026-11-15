import urllib.request, json

for call in range(1, 4):
    req = urllib.request.Request(f"http://localhost:3000/api/speed-test/questions?mode=random&subject=all&count=25&t={call}")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
        qs = data.get("questions", [])
        q_ids = [q['id'] for q in qs]
        print(f"Call {call}: First 3 question IDs: {q_ids[:3]}, Last 3: {q_ids[-3:]}")
