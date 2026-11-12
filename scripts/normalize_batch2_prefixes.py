import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for q in data:
    qt = q['question_text'].strip()
    
    # Normalize spaces for prefix detection
    norm = re.sub(r'\s+', ' ', qt).lower()
    
    if not qt.startswith('Select') and not qt.startswith('In ') and not qt.startswith('Which ') and not re.match(r'^\d+\s+is related', qt):
        # Case 1: number-pair / two numbers
        if any(norm.startswith(p) for p in ['the two numbers', 'thetwo numbers', 'numbers are related', 'numbersare related', 'which the two numbers', 'two numbers are']):
            q['question_text'] = 'Select the number-pair in which ' + re.sub(r'^(?:select the number-pair in which )?', '', qt, flags=re.I)
        # Case 2: numbers share relationship
        elif any(norm.startswith(p) for p in ['numbers share', 'numbersshare', 'the two numbers share']):
            q['question_text'] = 'Select the option in which ' + re.sub(r'^(?:select the option in which )?', '', qt, flags=re.I)
        # Case 3: to the [ordinal] (third, fourth, fifth, sixth, etc.)
        elif re.match(r'^(?:to\s*the|tothe|to\s*rhe)\s*(?:third|fourth|fifth|sixth|fth|ffth|fouth)', norm):
            q['question_text'] = 'Select the option that is related ' + re.sub(r'^(?:select the option that is related )?', '', qt, flags=re.I)
        # Case 4: related to / ed to the third number
        elif norm.startswith('related to the') or norm.startswith('ed to the'):
            q['question_text'] = 'Select the option that is ' + qt
        # Case 5: of the following is 43 related
        elif norm.startswith('of the following is'):
            q['question_text'] = 'To which ' + qt
        elif norm.startswith('logic. 1 is related'):
            q['question_text'] = 'Following the same ' + qt
        elif norm.startswith('thethird numberin'):
            q['question_text'] = 'Select the option that is related to ' + qt

# Save
with open('kiran_type2_307_verified.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Prefix normalization complete!")
