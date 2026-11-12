import json

with open(r'c:\ssczone\scripts\paper_inputs\paper_32.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions: {len(questions)}")

# Print basic stats about existing answers
from collections import Counter
counts = Counter(q['correct_answer'] for q in questions)
print("Initial answer distribution:", counts)

# Dump questions in readable format to scratch
with open(r'C:\Users\Admin\.gemini\antigravity\brain\1c1146ea-4cf3-4468-b8ed-3edfd749c66a\questions_dump.txt', 'w', encoding='utf-8') as out:
    for q in questions:
        qn = q.get('question_number')
        qid = q.get('id')
        qt = q.get('question_text')
        oa = q.get('option_a')
        ob = q.get('option_b')
        oc = q.get('option_c')
        od = q.get('option_d')
        ca = q.get('correct_answer')
        out.write(f"Q{qn} (ID: {qid}) [Current: {ca}]\n")
        out.write(f"Text: {qt}\n")
        out.write(f"A: {oa}\n")
        out.write(f"B: {ob}\n")
        out.write(f"C: {oc}\n")
        out.write(f"D: {od}\n")
        out.write("-" * 50 + "\n")
print("Dumped successfully.")
