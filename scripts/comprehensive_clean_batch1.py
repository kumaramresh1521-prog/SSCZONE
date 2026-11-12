import json
import re

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    for field in ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'explanation', 'exam_tag']:
        val = q.get(field, '')
        if not val:
            continue
        # Replace newlines with spaces except if intended
        val = val.replace('\r', ' ').replace('\n', ' ')
        # De-hyphenate words broken by hyphen + space
        val = re.sub(r'([a-zA-Z]{2,})-\s+([a-zA-Z]{2,})', r'\1\2', val)
        val = re.sub(r'\s+', ' ', val).strip()
        q[field] = val

# Additional specific cleanups:
for q in questions:
    # Remove weird OCR artifacts like "Peruto" or "fransporting"
    q['explanation'] = q['explanation'].replace('fransporting', 'transporting')
    q['explanation'] = q['explanation'].replace('Turkey bird (Peru bird)', 'Turkey bird')
    q['explanation'] = q['explanation'].replace('consldered', 'considered')
    q['explanation'] = q['explanation'].replace('mumberof', 'number of')
    q['explanation'] = q['explanation'].replace('Smalr', 'Small')
    q['explanation'] = q['explanation'].replace('Stmilarty', 'Similarly')
    q['explanation'] = q['explanation'].replace('Simllarly', 'Similarly')
    q['explanation'] = q['explanation'].replace('Simflarily', 'Similarly')
    q['explanation'] = q['explanation'].replace('tntensity', 'intensity')
    q['explanation'] = q['explanation'].replace('fntens-ty', 'intensity')
    q['explanation'] = q['explanation'].replace('fntensity', 'intensity')
    q['explanation'] = q['explanation'].replace('Bollng', 'Boiling')
    q['explanation'] = q['explanation'].replace('Boling', 'Boiling')
    q['explanation'] = q['explanation'].replace('extrerely', 'extremely')
    q['explanation'] = q['explanation'].replace('warmconditon', 'warm condition')
    q['explanation'] = q['explanation'].replace('referto', 'refer to')
    q['explanation'] = q['explanation'].replace('There-fore', 'Therefore')
    q['explanation'] = q['explanation'].replace('Therefore.the', 'Therefore, the')
    q['explanation'] = q['explanation'].replace('Similarly.Freezing', 'Similarly, Freezing')
    q['explanation'] = q['explanation'].replace('Similarly.', 'Similarly, ')
    
    # Clean question text
    q['question_text'] = q['question_text'].replace('opuion', 'option')
    q['question_text'] = q['question_text'].replace('opticn', 'option')
    q['question_text'] = q['question_text'].replace('opton', 'option')
    q['question_text'] = q['question_text'].replace('fth word', 'fifth word')
    q['question_text'] = q['question_text'].replace('sarne way', 'same way')
    q['question_text'] = q['question_text'].replace('Plastuic', 'Plastic')
    q['question_text'] = q['question_text'].replace('Plastue', 'Plastic')
    q['question_text'] = q['question_text'].replace('Frult', 'Fruit')
    q['question_text'] = q['question_text'].replace('Jotnts', 'Joints')
    q['question_text'] = q['question_text'].replace('Chill : ?', 'Chilli : ?')
    q['question_text'] = q['question_text'].replace('Stuck : :', 'Stick : :')

    # Clean option text
    for opt_key in ['option_a', 'option_b', 'option_c', 'option_d']:
        q[opt_key] = q[opt_key].replace('Plastuic', 'Plastic')
        q[opt_key] = q[opt_key].replace('Plastue', 'Plastic')
        q[opt_key] = q[opt_key].replace('Frult', 'Fruit')
        q[opt_key] = q[opt_key].replace('Jotnts', 'Joints')
        q[opt_key] = q[opt_key].replace('Fongiving', 'Forgiving')
        q[opt_key] = re.sub(r'^\([1-4]\)\s*', '', q[opt_key]).strip()

with open('kiran_type1_284_verified.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Comprehensive cleaning completed.")
