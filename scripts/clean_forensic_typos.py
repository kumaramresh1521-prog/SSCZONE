import json
import re
import unicodedata
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions.")

# Specific question refinements
curated_updates = {
    13: {
        'question_text': "'Bank' is related to 'Money' in the same way as 'Transport' is related to",
        'option_d': 'Traffic',
    },
    23: {
        'question_text': 'Umpire : Game',
        'option_a': 'Prodigy : Wonder',
        'option_b': 'Chef : Banquet',
        'option_c': 'Legislator : Election',
        'option_d': 'Moderator : Debate'
    },
    26: {
        'question_text': 'Action : Reaction',
        'option_a': 'Introvert : Extrovert',
        'option_b': 'Assail : Defend',
        'option_c': 'Diseased : Treatment',
        'option_d': 'Death : Rebirth'
    },
    30: {
        'question_text': 'Nuts : Bolts',
        'option_a': 'Nitty : Gritty',
        'option_b': 'Bare : Feet',
        'option_c': 'Naked : Clothes',
        'option_d': 'Hard : Soft'
    },
    34: {
        'explanation': "As, POLICE : SROLFH follows +3 on each letter (P+3=S, O+3=R, L+3=O, I+3=L, C+3=F, E+3=H). Similarly, applying -3 to DURXOG to find the original word gives D-3=A, U-3=R, R-3=O, X-3=U, O-3=N, G-3=D -> AROUND."
    },
    38: {
        'question_text': 'FILM : ADGH :: MILK : ?',
        'option_d': 'HDGF'
    },
    40: {
        'question_text': "Choose the option that expresses the same relationship as the word pair 'Tobacco : Cancer' has",
        'option_a': 'Milk : Food',
        'option_b': 'Bud : Flower',
        'option_c': 'Soil : Erosion',
        'option_d': 'Mosquito : Malaria'
    },
    41: {
        'question_text': 'West : North-East :: South : ?',
        'explanation': "If we move from West clockwise through 135°, we get North-East. Similarly, moving from South clockwise through 135° gives North-West."
    },
    42: {
        'question_text': 'KNQT : LORU :: ADGJ : ?',
        'option_d': 'MPVW',
        'explanation': "As K(11)+1=L(12), N(14)+1=O(15), Q(17)+1=R(18), T(20)+1=U(21) (+1 pattern). Similarly, applying +1 to ADGJ: A(1)+1=B(2), D(4)+1=E(5), G(7)+1=H(8), J(10)+1=K(11) -> BEHK."
    },
    43: {
        'option_b': 'NMPO',
        'explanation': "As Q(17)+3=T(20), P(16)+5=U(21), R(18)+5=W(23), S(19)+3=V(22) (+3, +5, +5, +3 pattern). Similarly, applying to JIKL: J(10)+3=M(13), I(9)+5=N(14), K(11)+5=P(16), L(12)+3=O(15) -> MNPO."
    },
    44: {
        'question_text': '42 : 56 :: 110 : ?',
        'explanation': "As 42 = 7² - 7, 56 = 8² - 8. Similarly, 110 = 11² - 11, and the next term is 12² - 12 = 144 - 12 = 132."
    },
    45: {
        'question_text': '5 : 100, 4 : 64 :: 4 : 80, 3 : ?',
        'option_d': '54',
        'explanation': "As 5 × 20 = 100, 4 × 16 = 64. Similarly, 4 × 20 = 80 and 3 × 16 = 48. Hence, ? = 48."
    },
    46: {
        'explanation': "Each letter is shifted by +13 positions: W(23)+13=J(10), R(18)+13=E(5), I(9)+13=V(22), T(20)+13=G(7), E(5)+13=R(18). Similarly, applying +13 to WRONG: W(23)+13=J(10), R(18)+13=E(5), O(15)+13=B(2), N(14)+13=A(1), G(7)+13=T(20) -> JEBAT."
    },
    52: {
        'explanation': "Letter position arrangement: letters 1 2 3 4 are rearranged to 2 1 4 3. In D(1) A(2) R(3) E(4) -> A(2) D(1) E(4) R(3). Similarly, in R(1) E(2) E(3) K(4) -> E(2) R(1) K(4) E(3) -> ERKE."
    },
    54: {
        'question_text': 'L × M : 12 × 13 :: U × W : ?',
        'option_a': '21 × 31',
        'option_b': '21 × 22',
        'option_c': '21 × 23',
        'option_d': '21 × 25',
        'explanation': "L and M are the 12th and 13th letters in the English alphabet. Similarly, U and W are the 21st and 23rd letters, giving 21 × 23."
    },
    58: {
        'question_text': 'Contiguous : Abut',
        'option_a': 'Possible : Occur',
        'option_b': 'Synthetic : Create',
        'option_c': 'Simultaneous : Coincide',
        'option_d': 'Constant : Stabilise'
    },
    60: {
        'explanation': "Every number in each set is a perfect square: in (49, 81, 25), 49 = 7², 81 = 9², 25 = 5². Similarly, in option (d) (100, 289, 4), 100 = 10², 289 = 17², 4 = 2²."
    },
    62: {
        'question_text': '(23 : 30 : 37)',
        'option_a': '(6 : 13 : 20)',
        'option_b': '(7 : 15 : 22)',
        'option_c': '(21 : 28 : 34)',
        'option_d': '(12 : 19 : 25)'
    },
    63: {
        'question_text': 'Omniscient : Knowledge',
        'option_a': 'Saturnine : Energy',
        'option_b': 'Boundless : Expanse',
        'option_c': 'Inquisitive : Science',
        'option_d': 'Complete : Retraction'
    },
    64: {
        'question_text': 'Nebulous : Form',
        'option_a': 'Insincere : Misanthrope',
        'option_b': 'Benevolent : Excellence',
        'option_c': 'Insipid : Taste',
        'option_d': 'Composed : Innocence'
    },
    69: {
        'question_text': 'Dark : Light :: Hot : ?',
        'option_a': 'Contaminated',
        'option_b': 'Accrued',
        'option_c': 'Diseased',
        'option_d': 'Cold'
    },
    71: {
        'question_text': 'HOPEFUL : LUFEPOH :: ETHNICITY : ?',
        'option_d': 'CINHTEYTI',
        'explanation': "As HOPEFUL written in reverse is LUFEPOH, similarly ETHNICITY written in reverse is YTICINHTE."
    },
    75: {
        'question_text': 'World War II : United Nations :: World War I : ?',
        'option_d': 'International Court of Justice'
    },
    76: {
        'question_text': '841 : 29 :: 289 : ?'
    },
    77: {
        'question_text': '8 : 28 :: 27 : ?'
    },
    79: {
        'question_text': 'F : 216 :: L : ?',
        'option_d': '1723'
    },
    82: {
        'question_text': 'AHOP : CKSU :: BJMF : ?',
        'option_d': 'CJWM',
        'explanation': "A+2=C, H+3=K, O+4=S, P+5=U (+2, +3, +4, +5 pattern). Applying to BJMF: B+2=D, J+3=M, M+4=Q, F+5=K -> DMQK."
    },
    83: {
        'question_text': 'EDUCATION : NOITACUDE :: INTELLIGENCE : ?'
    },
    84: {
        'option_b': 'SUNOB'
    },
    85: {
        'question_text': 'Australia : Continent',
        'option_d': 'Yuri Gagarin : Space'
    },
    86: {
        'question_text': 'CRITICISE : FULMINATE',
        'option_d': 'Land : Prevaricate'
    },
    104: {
        'question_text': "If 'Stallion' is for 'Mare', then",
        'option_d': "'Sow' is for 'Boar'",
        'explanation': "A 'Stallion' is a male horse while a 'Mare' is a female horse (Male : Female relationship). Similarly, in option (b), 'Ram' is a male sheep and 'Ewe' is a female sheep."
    },
    109: {
        'question_text': 'Russia : Moscow',
        'option_d': 'Pakistan : Faisalabad'
    },
    111: {
        'question_text': 'Ass : Bray'
    },
    112: {
        'question_text': 'Cigarette : Tobacco'
    },
    113: {
        'question_text': 'Traveller : Destination'
    },
    114: {
        'question_text': 'Apostate : Religion',
        'explanation': "'Apostate' is one who forsakes religion, in the same way a 'Traitor' is one who betrays his country."
    },
    115: {
        'question_text': 'Light : Glint'
    },
    119: {
        'option_b': 'Wattles : Turkey'
    },
    120: {
        'option_b': 'Cock : Hen'
    },
    122: {
        'question_text': "'Steel' is related to 'Alloy' in the same way as 'Zinc' is related to",
        'option_d': 'None of these'
    },
    127: {
        'question_text': '24 : 126 :: 48 : ?',
        'option_d': '344',
        'explanation': "As 24 = 5² - 1 and 126 = 5³ + 1. Similarly, 48 = 7² - 1 and the next term is 7³ + 1 = 343 + 1 = 344."
    },
    130: {
        'question_text': 'Valueless : Invaluable'
    },
    131: {
        'question_text': 'Thrust : Spear',
        'option_a': 'Scabbard : Sword',
        'option_d': 'Fence : Epee'
    },
    132: {
        'question_text': 'Money : Transaction',
        'option_b': 'Water : Drink',
        'option_c': 'Ideas : Exchange',
        'option_d': 'Language : Conversation'
    },
    137: {
        'explanation': "A+3=D, C+3=F, A+3=D, Z-3=W, X-3=U (+3, +3, +3, -3, -3 pattern). Applying to GIGTR: G+3=J, I+3=L, G+3=J, T-3=Q, R-3=O -> JLJQO."
    },
    138: {
        'question_text': '123 : 13² :: 235 : ?',
        'option_a': '23³',
        'option_b': '25³',
        'option_c': '35²',
        'option_d': '25²',
        'explanation': "In 123, combining the first and third digits gives base 13, and the middle digit 2 becomes the exponent: 13². Similarly, in 235, combining the first and third digits gives base 25, and the middle digit 3 becomes the exponent: 25³."
    },
    141: {
        'question_text': "'ABCD' is related to 'OPQR' in the same way as 'WXYZ' is related to",
        'option_d': 'QRST',
        'explanation': "Each letter is shifted by +14 positions: A+14=O, B+14=P, C+14=Q, D+14=R. Similarly, applying +14 to WXYZ: W+14=K, X+14=L, Y+14=M, Z+14=N -> KLMN."
    },
    147: {
        'option_b': 'BWHKT',
        'option_d': 'DWHKT',
        'explanation': "As R(18)+3=U(21), A(1)+2=C(3), D(4)+4=H(8), I(9)+2=K(11), O(15)+5=T(20) (+3, +2, +4, +2, +5 pattern). Applying to AUDIO: A(1)+3=D(4), U(21)+2=W(23), D(4)+4=H(8), I(9)+2=K(11), O(15)+5=T(20) -> DWHKT."
    }
}

# Char mapping for foreign/corrupt font glyphs
char_map = {
    '\u0410': 'A',  # Cyrillic A
    '\u0412': 'B',  # Cyrillic B
    '\u0415': 'E',  # Cyrillic E
    '\u041d': 'H',  # Cyrillic H
    '\u041e': 'O',  # Cyrillic O
    '\u0422': 'T',  # Cyrillic T
    '\u0430': 'a',  # Cyrillic a
    '\u0440': 'p',  # Cyrillic p
    '\u0397': 'H',  # Greek Eta
    '\u039f': 'O',  # Greek Omicron
}

for q in questions:
    num = q['question_number']
    if num in curated_updates:
        for k, v in curated_updates[num].items():
            q[k] = v
            
    # Apply global char mapping & cleansing on all text fields
    for field in ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'explanation']:
        val = q[field]
        
        # Replace Cyrillic / Greek lookalikes
        for ch, repl in char_map.items():
            val = val.replace(ch, repl)
            
        # Strip foreign non-printable / scripts (Arabic, Hebrew, Korean, nulls)
        val = re.sub(r'[\u0627\u0644\u0645\u0648\u05e9\uc774\ufffd]', '', val)
        
        # Strip leftover brackets like [SSC (CGL) 2013] or [MAT or [CLAT
        val = re.sub(r'\[[A-Za-z0-9\(\)\s\+\-]+(\]|\b)?', '', val)
        val = re.sub(r'\b(19|20)\d\d\]', '', val)
        
        # Strip trailing Directions or leak sentences
        val = re.sub(r'\b(Directions|Verbal Reasoning|questions? consist of|questions? there are|following questions?|choose the missing word|select that word|select the related word|select the answer pair|Indicate the answer choice|Each question has four analogies|Mark all correct analogies).*$', '', val, flags=re.I)
        
        # Clean extra spaces & punctuation
        val = re.sub(r'\s+', ' ', val).strip()
        q[field] = val
        
    # Ensure exam_tag is strictly None
    q['exam_tag'] = None

# Save sanitized dataset
with open('reasoning_analogy_155_verified.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Saved sanitized reasoning_analogy_155_verified.json successfully!")
