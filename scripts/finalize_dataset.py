import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Specific verified fixes:
fixes = {
    1: {
        'question_text': 'Menu : Food :: Catalogue : ?',
    },
    7: {
        'question_text': 'Taka : Bangladesh :: Lira : ?',
    },
    14: {
        'question_text': "'Fan' is related to 'Wings' in the same way as 'Wheel' is related to",
    },
    33: {
        'question_text': '? : ALKLO :: WOULD : TLRIA',
        'option_d': 'BLOCK'
    },
    35: {
        'question_text': 'Head : Hair :: Hand : ?',
        'option_d': 'Knee'
    },
    88: {
        'question_text': '5 : 35 :: ?',
        'option_a': '7 : 77',
        'option_b': '9 : 45',
        'option_c': '11 : 55',
        'option_d': '3 : 24'
    },
    123: {
        'question_text': 'Which of the following analogies does not have the same relationship as the others?',
        'option_a': 'Murrey : Black :: Magenta : Red',
        'option_b': 'Inter : Exhume :: Piebald : Homogenous',
        'option_c': 'Effete : Fructuous :: Chapfallen : Effervescent',
        'option_d': 'Selenology : Moon :: Epistemology : Knowledge'
    },
    124: {
        'question_text': 'Which of the following analogies does not have the same relationship as the others?',
        'option_a': 'Polyglot : Languages :: Polyphagous : Food',
        'option_b': 'Escutcheon : Scutcheon :: Fabulist : Liar',
        'option_c': 'Scurvy : Vitamin C :: Kwashiorkor : Protein',
        'option_d': 'Apothecary : Drugs :: Cruciverbalist : Crosswords'
    },
    125: {
        'question_text': 'MN / (AC · AD) : O / AE :: ?',
        'option_a': 'P / AF',
        'option_b': 'Q / AB',
        'option_c': 'P / AC',
        'option_d': 'R / AD'
    },
    126: {
        'question_text': 'If IQS : LNV, then JRM : ?',
        'option_d': 'MOQ'
    }
}

for q in questions:
    num = q['question_number']
    if num in fixes:
        for k, v in fixes[num].items():
            q[k] = v
            
    # Clean up standard spacing in question text
    txt = q['question_text']
    # standardize double colon
    txt = re.sub(r'\s*::\s*', ' :: ', txt)
    txt = re.sub(r'\s*:\s*:\s*', ' :: ', txt)
    # standardize single colon if between words: e.g. "Word:Word" -> "Word : Word"
    txt = re.sub(r'([a-zA-Z0-9\?])\s*:\s*([a-zA-Z0-9\?])', r'\1 : \2', txt)
    # clean extra spaces
    txt = re.sub(r'\s+', ' ', txt).strip()
    q['question_text'] = txt
    
    # Strip any exam tag from options or text
    for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
        val = q[opt_k]
        val = re.sub(r'\[.*?\]', '', val).strip()
        val = re.sub(r'\s+', ' ', val).strip()
        q[opt_k] = val

with open('reasoning_analogy_155_questions_final.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Saved cleaned reasoning_analogy_155_questions_final.json!")
