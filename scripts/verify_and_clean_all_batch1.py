import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load the verified dataset
with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Load the explanation parsed data
with open('parsed_284_explanations.json', 'r', encoding='utf-8') as f:
    expl_data = json.load(f)

letter_map = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}
digit_map = {'A': 1, 'B': 2, 'C': 3, 'D': 4}

print(f"Loaded {len(questions)} questions and {len(expl_data)} explanation records.")

def clean_ocr_text(txt):
    if not txt:
        return ""
    # 1. Join broken hyphenated words across linebreaks/spaces
    # e.g., 'frans- porting' -> 'transporting', 'Simi- larly' -> 'Similarly', 'relat- ed' -> 'related'
    txt = re.sub(r'frans-\s*porting', 'transporting', txt, flags=re.I)
    txt = re.sub(r'([a-zA-Z]{2,})-\s+([a-zA-Z]{2,})', r'\1\2', txt)
    
    # 2. Common OCR word joins and fixes
    fixes = [
        (r'\bconsldered\b', 'considered'),
        (r'\bStmilarly\b', 'Similarly'),
        (r'\bSimllarly\b', 'Similarly'),
        (r'\bSimi-larly\b', 'Similarly'),
        (r'\bSimilar-ly\b', 'Similarly'),
        (r'\bSim-ilarly\b', 'Similarly'),
        (r'\bSim- ilarly\b', 'Similarly'),
        (r'\bSimi- larly\b', 'Similarly'),
        (r'\bextrerely\b', 'extremely'),
        (r'\bBollng\b', 'Boiling'),
        (r'\bBoling\b', 'Boiling'),
        (r'\bfntens- ty\b', 'intensity'),
        (r'\btntensity\b', 'intensity'),
        (r'\bmumberof\b', 'number of'),
        (r'\bthefrst\b', 'the first'),
        (r'\bthefirst\b', 'the first'),
        (r'\bthesecond\b', 'the second'),
        (r'\bThefirst\b', 'The first'),
        (r'\bThesecond\b', 'The second'),
        (r'\bthesec-ond\b', 'the second'),
        (r'\bArectangle\b', 'A rectangle'),
        (r'\bfirstFridaycomes\b', 'first. Friday comes'),
        (r'\bjustafter\b', 'just after'),
        (r'\bSimilarly,Tuesday\b', 'Similarly, Tuesday'),
        (r'\bcustomersin\b', 'customers in'),
        (r'\btheRestaurant\b', 'the Restaurant'),
        (r'\bthehabitat\b', 'the habitat'),
        (r'\bofthe\b', 'of the'),
        (r'\bofthem\b', 'of them'),
        (r'\btothe\b', 'to the'),
        (r'\binthe\b', 'in the'),
        (r'\bonthe\b', 'on the'),
        (r'\bisthe\b', 'is the'),
        (r'\bisa\b', 'is a'),
        (r'\biscalled\b', 'is called'),
        (r'\bisknown\b', 'is known'),
        (r'\bwhichmakes\b', 'which makes'),
        (r'\bwhichcontrols\b', 'which controls'),
        (r'\btheantonym\b', 'the antonym'),
        (r'\bbirdsis\b', 'birds is'),
        (r'\beachto\b', 'each to'),
        (r'\bbelongstothe\b', 'belongs to the'),
        (r'\bclassMammal\b', 'class Mammal'),
        (r'\bbeconsidered\b', 'be considered'),
        (r'\bEnglishwords\b', 'English words'),
        (r'\bthenumber\b', 'the number'),
        (r'\bberofconsonants\b', 'number of consonants'),
        (r'\bvowelsinthe\b', 'vowels in the word)'),
        (r'\bdisorder\b', 'disorder'),
        (r'\bSmalr\b', 'Small'),
        (r'\bCircumfer ence\b', 'Circumference'),
        (r'\blst Sitting\b', '1st Sitting'),
        (r'\(lst Sitting', '(1st Sitting)'),
        (r'K5279/\d+', '')
    ]
    for pattern, repl in fixes:
        txt = re.sub(pattern, repl, txt)
    
    # Clean whitespace and trailing junk
    txt = re.sub(r'[ \t]+', ' ', txt).strip()
    return txt

def clean_exam_tag(tag):
    if not tag:
        return ""
    tag = tag.strip()
    # Fix (lst Sitting -> (1st Sitting)
    tag = re.sub(r'\(lst Sitting\b', '(1st Sitting)', tag)
    tag = re.sub(r'\(lst\s+Sitting\)?', '(1st Sitting)', tag)
    tag = re.sub(r'\(2nd\s+Sitting\)?', '(2nd Sitting)', tag)
    tag = re.sub(r'\(Shift-D\)', '(Shift-I)', tag) # OCR 'D' for 'I'
    tag = re.sub(r'\(Shift-n\)', '(Shift-II)', tag)
    tag = re.sub(r'\(Shift-Ill\)', '(Shift-III)', tag)
    tag = re.sub(r'\(Shif-I\)', '(Shift-I)', tag)
    tag = re.sub(r'\(Shif-n\)', '(Shift-II)', tag)
    tag = re.sub(r'\(Shit-\)', '(Shift-I)', tag)
    tag = re.sub(r'Exan\b', 'Exam', tag)
    tag = re.sub(r'TIer-I\b', 'Tier-I', tag)
    tag = re.sub(r'Tler-I\b', 'Tier-I', tag)
    tag = re.sub(r'K5279/\d+', '', tag).strip()
    tag = re.sub(r'[\(\)]+$', lambda m: ')' if '(' in tag and tag.count('(') > tag.count(')') else m.group(0), tag)
    if '(' in tag and ')' not in tag:
        tag += ')'
    tag = re.sub(r'\s+', ' ', tag).strip()
    return tag

# Audit and update all questions
updated_questions = []

for q in questions:
    qnum = q['question_number']
    qtext = clean_ocr_text(q['question_text'])
    opa = clean_ocr_text(q['option_a'])
    opb = clean_ocr_text(q['option_b'])
    opc = clean_ocr_text(q['option_c'])
    opd = clean_ocr_text(q['option_d'])
    etag = clean_exam_tag(q.get('exam_tag', ''))
    
    # Explanation
    expl_rec = expl_data.get(str(qnum))
    if expl_rec and len(expl_rec['explanation']) > 15:
        # Use authentic explanation from book
        expl_text = clean_ocr_text(expl_rec['explanation'])
        ans_letter = letter_map[expl_rec['ans_digit']]
    else:
        # Keep existing cleaned explanation
        expl_text = clean_ocr_text(q.get('explanation', ''))
        ans_letter = q['correct_answer']
        
    # Manual overrides for confirmed book edge cases:
    if qnum == 36:
        # Lawyer : Justice :: Arbitrator : Settlement
        ans_letter = 'C'
        expl_text = "Lawyer pleads in the court for justice to his/her client. Similarly, Arbitrator settles the matter between the two parties."
    elif qnum == 38:
        # Cinema : Audience :: Church : Congregation
        ans_letter = 'A'
        expl_text = "Audience gathers in a Cinema hall to watch movies. Similarly, Congregation gathers in a Church for religious worship."
    elif qnum == 10:
        ans_letter = 'C'
        expl_text = "Police arrest criminals to check crimes. Similarly, doctor treats patient to cure illness."
    elif qnum == 4:
        ans_letter = 'D'
        expl_text = "Truck belongs to the class Vehicle. Similarly, Green belongs to the class Colour (Item : Category relationship)."

    # Remove any unclosed prompt boilerplate in question_text
    # e.g.: "(The words must be considered as meaningful English words and must NOT be related to each other based on the number of letters/number of consonants/vowels in the word)"
    if 'Boiling : Lukewarm : : Freezing : ?' in qtext:
        qtext = "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nBoiling : Lukewarm : : Freezing : ?"

    updated_questions.append({
        'question_number': qnum,
        'question_text': qtext,
        'option_a': opa,
        'option_b': opb,
        'option_c': opc,
        'option_d': opd,
        'correct_answer': ans_letter,
        'explanation': expl_text,
        'exam_tag': etag,
        'topic_id': q.get('topic_id', 242),
        'tier_level': 'Type-I',
        'difficulty': 'medium',
        'is_active': True
    })

print(f"Processed {len(updated_questions)} questions successfully.")

# Save to verified json
with open('kiran_type1_284_verified.json', 'w', encoding='utf-8') as f:
    json.dump(updated_questions, f, ensure_ascii=False, indent=2)

print("Saved clean verified kiran_type1_284_verified.json")
