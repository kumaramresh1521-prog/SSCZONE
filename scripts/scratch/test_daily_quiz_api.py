import urllib.request, json

req = urllib.request.Request("http://localhost:3000/api/daily-quiz")
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())

print("API /api/daily-quiz response:")
print(f"Success: {data.get('success')}, Total quizzes: {data.get('count')}")
for q in data.get("quizzes", []):
    print(f"  - [{q['subject_key'].upper()}] {q['title']} (Questions: {q.get('total_questions')}, Duration: {q.get('duration_minutes')} min)")

# Also test fetching details of first quiz
first_quiz_id = data.get("quizzes", [])[0]["id"]
req_detail = urllib.request.Request(f"http://localhost:3000/api/daily-quiz/{first_quiz_id}")
with urllib.request.urlopen(req_detail) as resp:
    detail_data = json.loads(resp.read())
    q_items = detail_data.get("quiz", {}).get("questions", [])
    print(f"\nFetched full quiz '{first_quiz_id}': {len(q_items)} questions!")
    print(f"Sample Question 1: {repr(q_items[0]['question_text'][:80])}")
    print(f"  Source shift: {q_items[0].get('source')}")
    print(f"  Section: {q_items[0].get('section_name')}")
