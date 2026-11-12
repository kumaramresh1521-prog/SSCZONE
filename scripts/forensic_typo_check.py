import json
import sys
import unicodedata
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions for forensic typo analysis.\n")

issues = []

for q in questions:
    num = q['question_number']
    txt = q['question_text']
    oa = q['option_a']
    ob = q['option_b']
    oc = q['option_c']
    od = q['option_d']
    exp = q['explanation']
    
    # 1. Check for replacement character \ufffd () or control chars
    for field_name, field_val in [('question_text', txt), ('option_a', oa), ('option_b', ob), ('option_c', oc), ('option_d', od), ('explanation', exp)]:
        if '\ufffd' in field_val:
            issues.append((num, field_name, 'Contains  (replacement character)', field_val))
            
        # Check for non-ASCII characters that might be weird
        for ch in field_val:
            cat = unicodedata.category(ch)
            # check Cyrillic or other scripts
            script_name = unicodedata.name(ch, '')
            if 'CYRILLIC' in script_name:
                issues.append((num, field_name, f'Contains Cyrillic character: {ch} ({script_name})', field_val))
                break
            if 'GREEK' in script_name and ch not in ['π', 'θ', 'α', 'β']:
                issues.append((num, field_name, f'Contains Greek character: {ch} ({script_name})', field_val))
                break
                
    # 2. Check for scrambled phrasing like "in the way same as" or "same as related to"
    if 'the way same as' in txt or 'same as related to' in txt or 'way same as' in txt:
        issues.append((num, 'question_text', 'Scrambled phrasing in word analogy prompt', txt))
        
    # 3. Check for exponents extracted as adjacent digits in explanation
    # e.g. "49 = 72" or "81 = 92" or "25 = 52" or "100 = 102" or "289 = 172"
    m_exp = re.search(r'\b(\d{2,4})\s*=\s*(\d{1,2})([23])\b', exp)
    if m_exp:
        val = int(m_exp.group(1))
        base = int(m_exp.group(2))
        power = int(m_exp.group(3))
        if base ** power == val:
            issues.append((num, 'explanation', f'Broken exponent: {val} = {base}{power} should be {base}^{power}', exp))

    # 4. Check for double punctuation or colon errors
    if re.search(r':\s*:\s*:', txt) or re.search(r'\?\s*\?', txt):
        issues.append((num, 'question_text', 'Weird punctuation in question', txt))
        
    # 5. Check if question text has leftover PDF artifacts like "Take a Leap" or "Master"
    if any(k in txt.lower() for k in ['master', 'exercise', 'direction', 'leap', 'verbal reasoning']):
        issues.append((num, 'question_text', 'Stray book heading word', txt))

print(f"Total forensic issues found: {len(issues)}")
for iss in issues:
    print(f"Q{iss[0]} [{iss[1]}] -> {iss[2]}")
    print(f"   Context: {iss[3][:120]}...\n")
