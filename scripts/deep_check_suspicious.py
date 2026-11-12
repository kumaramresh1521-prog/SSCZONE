import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_questions_final.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Check for any oddities:
# 1. Option text equals question text
# 2. Option text contains ':' when it shouldn't, or doesn't when it should
# 3. Question text ending abruptly with ':' or '::'
# 4. Incomplete sentences

suspicious = []

for q in questions:
    num = q['question_number']
    txt = q['question_text']
    oa = q['option_a']
    ob = q['option_b']
    oc = q['option_c']
    od = q['option_d']
    exp = q['explanation']
    
    # Check if question text ends with just ":" or "::"
    if txt.endswith('::') or txt.endswith(':'):
        suspicious.append((num, 'Question ends with colon', txt))
        
    # Check if any option is equal to another option
    opts = [oa, ob, oc, od]
    if len(set(opts)) < 4:
        suspicious.append((num, 'Duplicate options found', f"A={oa}, B={ob}, C={oc}, D={od}"))
        
    # Check if question text has '?' missing in a question that needs it
    if '::' in txt and '?' not in txt and not any(k in txt for k in ['If', 'Find', 'same', 'similar']):
        suspicious.append((num, 'Missing ? in analogy statement', txt))
        
    # Check explanation length
    if len(exp) < 15:
        suspicious.append((num, 'Suspiciously short explanation', exp))

print(f"Total suspicious items flagged: {len(suspicious)}")
for s in suspicious:
    print(f"  Q{s[0]}: [{s[1]}] -> {s[2]}")
