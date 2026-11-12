import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions: {len(questions)}")

hyphen_issues = []
empty_options = []
short_explanations = []

for q in questions:
    qnum = q['question_number']
    qtext = q['question_text']
    exp = q['explanation']
    
    # check options
    for k in ['option_a', 'option_b', 'option_c', 'option_d']:
        if not q[k] or len(q[k].strip()) == 0:
            empty_options.append((qnum, k))
            
    # check hyphens
    m_q = re.findall(r'[a-zA-Z]{3,}-\s+[a-zA-Z]{3,}', qtext)
    if m_q:
        hyphen_issues.append((qnum, 'qtext', m_q))
    m_exp = re.findall(r'[a-zA-Z]{3,}-\s+[a-zA-Z]{3,}', exp)
    if m_exp:
        hyphen_issues.append((qnum, 'exp', m_exp))
        
    if len(exp) < 15:
        short_explanations.append((qnum, exp))

print(f"Empty options count: {len(empty_options)}")
print(f"Broken hyphens count: {len(hyphen_issues)}")
for h in hyphen_issues[:10]:
    print(" ", h)
print(f"Short explanations count: {len(short_explanations)}")

# Print test samples
sample_nums = [1, 4, 10, 28, 36, 38, 52, 72, 84, 100, 189, 284]
for s in sample_nums:
    q = questions[s - 1]
    print(f"\n==================== QUESTION {q['question_number']} ====================")
    print(f"Exam Tag : {q['exam_tag']}")
    print(f"Question : {q['question_text']}")
    print(f"(A) {q['option_a']}")
    print(f"(B) {q['option_b']}")
    print(f"(C) {q['option_c']}")
    print(f"(D) {q['option_d']}")
    print(f"Answer   : ({q['correct_answer']})")
    print(f"Expl     : {q['explanation']}")
