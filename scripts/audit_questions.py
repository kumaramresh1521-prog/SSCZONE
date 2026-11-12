import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_questions_final.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions loaded for audit: {len(questions)}")

flags = []

for q in questions:
    num = q['question_number']
    txt = q['question_text']
    oa = q['option_a']
    ob = q['option_b']
    oc = q['option_c']
    od = q['option_d']
    ans = q['correct_answer']
    exp = q['explanation']
    
    # 1. Check for stray artifacts in question_text
    if any(k in txt for k in ['Directions', 'Master', 'Verbal Reasoning', 'Analogy']):
        flags.append((num, 'question_text contains header/direction word', txt[:80]))
    if re.search(r'\[.*?\]', txt):
        flags.append((num, 'question_text contains unstripped [exam_tag]', txt))
        
    # 2. Check for stray artifacts in options
    for opt_name, opt_val in [('A', oa), ('B', ob), ('C', oc), ('D', od)]:
        if re.search(r'\[.*?\]', opt_val):
            flags.append((num, f'Option {opt_name} contains unstripped [exam_tag]', opt_val))
        if re.search(r'^\([a-e]\)', opt_val):
            flags.append((num, f'Option {opt_name} has redundant prefix', opt_val))
        if len(opt_val.strip()) == 0:
            flags.append((num, f'Option {opt_name} is empty', ''))
            
    # 3. Check for answer validity
    if ans not in ['A', 'B', 'C', 'D']:
        flags.append((num, f'Invalid answer letter: {ans}', ''))
        
    # 4. Check explanation length & answer consistency
    if len(exp.strip()) < 10:
        flags.append((num, 'Very short explanation', exp))
        
    # Check if explanation mentions an answer letter like "(b)" or "(c)" that contradicts `ans`
    first_letter_match = re.search(r'^\s*\(?([a-dA-D])\)?', exp)
    if first_letter_match:
        exp_letter = first_letter_match.group(1).upper()
        if exp_letter != ans:
            flags.append((num, f'Answer mismatch: assigned {ans} but explanation starts with {exp_letter}', exp[:80]))

print(f"\nAudit complete. Total flags found: {len(flags)}")
for f in flags:
    print(f"  Q{f[0]}: [{f[1]}] -> {f[2]}")
