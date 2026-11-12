import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load final questions
with open('reasoning_analogy_155_questions_final.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Comprehensive dictionary of precise question texts and options for all flagged/audited questions
curated_fixes = {
    1: {
        'question_text': 'Menu : Food :: Catalogue : ?',
        'option_a': 'Rack', 'option_b': 'Newspaper', 'option_c': 'Library', 'option_d': 'Books',
        'correct_answer': 'D',
        'explanation': "'Menu' lists all the food items in a restaurant and in the same way, a 'Catalogue' is a list of all the books in a library."
    },
    7: {
        'question_text': 'Taka : Bangladesh :: Lira : ?',
        'option_a': 'Kuwait', 'option_b': 'Italy', 'option_c': 'Sri Lanka', 'option_d': 'Kenya',
        'correct_answer': 'B',
        'explanation': "Taka is the currency of Bangladesh. Similarly, Lira is the currency of Italy."
    },
    14: {
        'question_text': "'Fan' is related to 'Wings' in the same way as 'Wheel' is related to",
        'option_a': 'Round', 'option_b': 'Cars', 'option_c': 'Spokes', 'option_d': 'Moves',
        'correct_answer': 'C',
        'explanation': "'Wings' (blades) are the parts of a 'Fan'. Likewise, 'Spokes' are the parts of a 'Wheel'."
    },
    27: {
        'question_text': 'Triangle : Hexagon',
        'option_a': 'Cone : Sphere', 'option_b': 'Rectangle : Octagon', 'option_c': 'Pentagon : Heptagon', 'option_d': 'Angle : Quadrilateral',
        'correct_answer': 'B',
        'explanation': "Sides in figure second are double the sides of figure first. A hexagon has 6 sides (double of triangle's 3 sides), and an octagon has 8 sides (double of rectangle's 4 sides)."
    },
    31: {
        'question_text': 'King : Royal :: ? : Religious',
        'option_a': 'Prayer', 'option_b': 'Saint', 'option_c': 'Priesthood', 'option_d': 'Holy book',
        'correct_answer': 'D',
        'explanation': "Second shows the quality of the first. 'Royal' is the quality associated with a 'King', similarly 'Religious' is the quality associated with a 'Holy book'."
    },
    33: {
        'question_text': '? : ALKLO :: WOULD : TLRIA',
        'option_a': 'DONOR', 'option_b': 'CONES', 'option_c': 'BARGE', 'option_d': 'BLOCK',
        'correct_answer': 'A',
        'explanation': "W-3=T, O-3=L, U-3=R, L-3=I, D-3=A (-3 pattern). Applying +3 to ALKLO to find original word: A+3=D, L+3=O, K+3=N, L+3=O, O+3=R -> DONOR."
    },
    35: {
        'question_text': 'Head : Hair :: Hand : ?',
        'option_a': 'Finger', 'option_b': 'Ear', 'option_c': 'Neck', 'option_d': 'Knee',
        'correct_answer': 'A',
        'explanation': "Hair is located on Head, similarly Finger is located on Hand."
    },
    37: {
        'question_text': 'King : Throne :: Rider : ?',
        'option_a': 'Chair', 'option_b': 'Horse', 'option_c': 'Seat', 'option_d': 'Saddle',
        'correct_answer': 'D',
        'explanation': "A 'King' sits on a 'Throne' and a 'Rider' sits on a 'Saddle'."
    },
    66: {
        'question_text': 'Brain : Neurology',
        'option_a': 'Biology : Animals', 'option_b': 'Hydrology : Water', 'option_c': 'Body : Physiology', 'option_d': 'Entomology : Plants',
        'correct_answer': 'C',
        'explanation': "As study of 'Brain' is called 'Neurology', similarly study of 'Body' is called 'Physiology'."
    },
    78: {
        'question_text': 'Tanning : Leather :: Pyrotechnics : ?',
        'option_a': 'Bombs', 'option_b': 'Fireworks', 'option_c': 'Wool', 'option_d': 'Machinery',
        'correct_answer': 'B',
        'explanation': "As for finishing 'Leather', 'Tanning' process is used, in the same way 'Pyrotechnics' is the craft of making 'Fireworks'."
    },
    80: {
        'question_text': 'MOUSE : KPSTC :: LIGHT : ?',
        'option_a': 'MGHFU', 'option_b': 'JGEFR', 'option_c': 'JJEIR', 'option_d': 'MJHIU',
        'correct_answer': 'C',
        'explanation': "M-2=K, O+1=P, U-2=S, S+1=T, E-2=C (-2, +1 pattern). Applying to LIGHT: L-2=J, I+1=J, G-2=E, H+1=I, T-2=R -> JJEIR."
    },
    88: {
        'question_text': '5 : 35 :: ?',
        'option_a': '7 : 77', 'option_b': '9 : 45', 'option_c': '11 : 55', 'option_d': '3 : 24',
        'correct_answer': 'A',
        'explanation': "As 5 × 7 = 35 (5 multiplied by the next prime number 7), similarly 7 × 11 = 77 (7 multiplied by the next prime number 11). Hence, 7 : 77."
    },
    96: {
        'question_text': 'A : Transaction :: Language : B',
        'option_a': 'A. Money, B. Communication', 'option_b': 'A. Bank, B. Conversation', 'option_c': 'A. Business, B. Message', 'option_d': 'A. Cheque, B. Grammar',
        'correct_answer': 'A',
        'explanation': "As 'Money' is the medium of 'Transaction', similarly 'Language' is the medium of 'Communication'."
    },
    97: {
        'question_text': 'A : Inert :: Active : B',
        'option_a': 'A. Static, B. Dynamic', 'option_b': 'A. Motion, B. Rest', 'option_c': 'A. Dormant, B. Reaction', 'option_d': 'A. Heavy, B. Energetic',
        'correct_answer': 'A',
        'explanation': "Both pairs are synonyms: 'Static' is synonymous with 'Inert', and 'Active' is synonymous with 'Dynamic'."
    },
    98: {
        'question_text': 'A : Gum :: Worm : B',
        'option_a': 'A. Tree, B. Silk', 'option_b': 'A. Loaf, B. Tread', 'option_c': 'A. Bottle, B. Insect', 'option_d': 'A. Brand, B. Cocoon',
        'correct_answer': 'A',
        'explanation': "'Tree' produces 'Gum', and 'Worm' (silkworm) produces 'Silk'."
    },
    99: {
        'question_text': 'Lightning : A :: B : Sky',
        'option_a': 'A. Rain, B. Thunder', 'option_b': 'A. Rainbow, B. Wind', 'option_c': 'A. Cloud, B. Rainbow', 'option_d': 'A. Sky, B. Rain',
        'correct_answer': 'C',
        'explanation': "'Lightning' originates from 'Cloud' (A), and 'Rainbow' (B) appears in the 'Sky'."
    },
    100: {
        'question_text': 'A : Ocean :: Stone : B',
        'option_a': 'A. Glacier, B. Granite', 'option_b': 'A. River, B. Pebble', 'option_c': 'A. Lake, B. Rock', 'option_d': 'A. Continent, B. Mountain',
        'correct_answer': 'C',
        'explanation': "A 'Lake' is smaller than an 'Ocean', and a 'Stone' is smaller than a 'Rock'."
    },
    101: {
        'question_text': 'Communication : Message :: ? : ?',
        'option_a': 'Humor : Delight', 'option_b': 'Expression : Words', 'option_c': 'Clarification : Doubt', 'option_d': 'Emission : Cosmic',
        'correct_answer': 'B',
        'explanation': "'Message' is used for 'Communication', similarly 'Words' are used for 'Expression'."
    },
    102: {
        'question_text': 'Activate : Detonate :: ? : ?',
        'option_a': 'Deaden : Defuse', 'option_b': 'Expression : Words', 'option_c': 'Connect : Detach', 'option_d': 'Inform : Deform',
        'correct_answer': 'A',
        'explanation': "'Activate' and 'Detonate' are synonyms (causing explosion), and 'Deaden' and 'Defuse' are synonyms (deactivating an explosive)."
    },
    105: {
        'question_text': 'Mycology : Fungi :: Pedology : ?',
        'option_a': 'Moon', 'option_b': 'Kidney', 'option_c': 'Child', 'option_d': 'Soil',
        'correct_answer': 'D',
        'explanation': "'Mycology' is the study of 'Fungi' and 'Pedology' is the study of 'Soil'."
    },
    106: {
        'question_text': 'Alleviate : Aggravate :: Elastic : ?',
        'option_a': 'Rigid', 'option_b': 'Flexible', 'option_c': 'Malleable', 'option_d': 'Strong',
        'correct_answer': 'A',
        'explanation': "'Alleviate' and 'Aggravate' are antonyms, similarly 'Elastic' and 'Rigid' are antonyms."
    },
    108: {
        'question_text': 'Benevolent : Kind :: Unclear : ?',
        'option_a': 'Bright', 'option_b': 'Thick', 'option_c': 'Luminous', 'option_d': 'Muddy',
        'correct_answer': 'D',
        'explanation': "'Benevolent' is synonymous with 'Kind', and 'Unclear' is synonymous with 'Muddy'."
    },
    118: {
        'question_text': 'Surgeon : Scalpel',
        'option_a': 'Musician : Instrument', 'option_b': 'Carpenter : Cabinet', 'option_c': 'Sculptor : Chisel', 'option_d': 'Baker : Oven',
        'correct_answer': 'C',
        'explanation': "A 'Surgeon' uses 'Scalpel' for operating, in the same way a 'Sculptor' uses 'Chisel' for sculpting."
    },
    123: {
        'question_text': 'Which of the following analogies does not have the same relationship as the others?',
        'option_a': 'Murrey : Black :: Magenta : Red',
        'option_b': 'Inter : Exhume :: Piebald : Homogenous',
        'option_c': 'Effete : Fructuous :: Chapfallen : Effervescent',
        'option_d': 'Selenology : Moon :: Epistemology : Knowledge',
        'correct_answer': 'C',
        'explanation': "In option (a) the relationship is Derivative colour : Main colour. In (b) there is relationship of opposite. In (c) the given pairs are synonyms rather than antonyms. In (d) the relationship is Branch of study : Field."
    },
    124: {
        'question_text': 'Which of the following analogies does not have the same relationship as the others?',
        'option_a': 'Polyglot : Languages :: Polyphagous : Food',
        'option_b': 'Escutcheon : Scutcheon :: Fabulist : Liar',
        'option_c': 'Scurvy : Vitamin C :: Kwashiorkor : Protein',
        'option_d': 'Apothecary : Drugs :: Cruciverbalist : Crosswords',
        'correct_answer': 'C',
        'explanation': "In options (a), (b), and (d) the pairs represent synonymous functions or characteristics, while in option (c) the relationship is Disease : Caused by deficiency of nutrient."
    },
    125: {
        'question_text': 'MN / (AC · AD) : O / AE :: ?',
        'option_a': 'P / AF', 'option_b': 'Q / AB', 'option_c': 'P / AC', 'option_d': 'R / AD',
        'correct_answer': 'A',
        'explanation': "As M(13) N(14) in numerator and AC(1,3) AD(1,4) in denominator progresses by +1 to O(15) / AE(1,5), the next term following the +1 progression is P(16) / AF(1,6). Hence, ? = P / AF."
    },
    126: {
        'question_text': 'If IQS : LNV, then JRM : ?',
        'option_a': 'OKS', 'option_b': 'MOP', 'option_c': 'NIP', 'option_d': 'MOQ',
        'correct_answer': 'B',
        'explanation': "I+3=L, Q-3=N, S+3=V (+3, -3, +3 pattern). Applying to JRM: J+3=M, R-3=O, M+3=P -> MOP."
    },
    142: {
        'question_text': 'I : Increase :: Descend : II. Below are choices for I (A. Grow, B. Ascend, C. Rise, D. Price) and II (P. Reduce, Q. Down, R. Decrease, S. Mountain). Which pair completes the analogy?',
        'option_a': 'AR', 'option_b': 'RB', 'option_c': 'CP', 'option_d': 'DQ',
        'correct_answer': 'B',
        'explanation': "'Ascend' (B) is the antonym of 'Descend', and 'Increase' is the antonym of 'Decrease' (R). Hence, the matching pair is (b) RB."
    },
    143: {
        'question_text': 'Modern : I :: II : Old. Below are choices for I (A. Ancient, B. Death, C. Famous, D. Civilization) and II (P. Industrialisation, Q. Young, R. Fashion, S. Western). Which pair completes the analogy?',
        'option_a': 'AQ', 'option_b': 'AS', 'option_c': 'BP', 'option_d': 'CR',
        'correct_answer': 'A',
        'explanation': "'Modern' and 'Ancient' (A) are antonyms, similarly 'Young' (Q) and 'Old' are antonyms. Hence, the matching pair is (a) AQ."
    },
    144: {
        'question_text': 'Part : I :: Class : II. Below are choices for I (A. Section, B. Whole, C. School, D. Student) and II (P. Student, Q. School, R. Teachers, S. Rooms). Which pair completes the analogy?',
        'option_a': 'AR', 'option_b': 'BQ', 'option_c': 'CP', 'option_d': 'DS',
        'correct_answer': 'B',
        'explanation': "'Part' is a constituent of 'Whole' (B), and 'Class' is a constituent of 'School' (Q). Hence, the matching pair is (b) BQ."
    },
    145: {
        'question_text': 'Summit : Apex :: I : II. Below are choices for I (A. Beautiful, B. Picture, C. Attractive, D. Enchanting) and II (P. Comfortable, Q. Pretty, R. Healthy, S. Brave). Which pair completes the analogy?',
        'option_a': 'AQ', 'option_b': 'BP', 'option_c': 'DS', 'option_d': 'CR',
        'correct_answer': 'A',
        'explanation': "'Summit' and 'Apex' are synonyms, similarly 'Beautiful' (A) and 'Pretty' (Q) are synonyms. Hence, the matching pair is (a) AQ."
    },
    148: {
        'question_text': 'Rectangle : Pentagon',
        'option_a': 'Triangle : Rectangle', 'option_b': 'Diagonal : Perimeter', 'option_c': 'Side : Angle', 'option_d': 'Circle : Square',
        'correct_answer': 'A',
        'explanation': "A Rectangle has 4 sides and a Pentagon has 5 sides (4 to 5 sides, n to n+1). Similarly, a Triangle has 3 sides and a Rectangle has 4 sides (3 to 4 sides). Hence, Triangle : Rectangle."
    },
    149: {
        'question_text': 'Simmer : Boil',
        'option_a': 'Glide : Drift', 'option_b': 'Drizzle : Downpour', 'option_c': 'Gambol : Play', 'option_d': 'Stagnate : Flow',
        'correct_answer': 'B',
        'explanation': "'Simmer' means to heat gently below boiling point, and 'Boil' is heating vigorously. In the same way, 'Drizzle' is light rain and 'Downpour' is heavy rain (intensity progression)."
    },
    150: {
        'question_text': 'Propensity : Tendency',
        'option_a': 'Prologue : Epilogue', 'option_b': 'Master : Slave', 'option_c': 'Audacity : Impudence', 'option_d': 'Conduct : Immortality',
        'correct_answer': 'C',
        'explanation': "'Propensity' and 'Tendency' are synonyms. Similarly, 'Audacity' and 'Impudence' are synonyms."
    },
    151: {
        'question_text': 'Intimidate : Wheedle',
        'option_a': 'Resolute : Impetuous', 'option_b': 'Coordinate : Disinter', 'option_c': 'Defile : Rebuke', 'option_d': 'Extol : Disparage',
        'correct_answer': 'D',
        'explanation': "'Intimidate' and 'Wheedle' are antonyms (intimidate = threaten, wheedle = flatter/coax). Similarly, 'Extol' (praise) and 'Disparage' (belittle) are antonyms."
    },
    152: {
        'question_text': 'Indefatigable : Inveterate',
        'option_a': 'Tireless : Tired', 'option_b': 'Tired : Habitual', 'option_c': 'Tireless : Habitual', 'option_d': 'Impoverished : Habitual',
        'correct_answer': 'C',
        'explanation': "'Indefatigable' means tireless, and 'Inveterate' means habitual. Hence, Tireless : Habitual."
    },
    153: {
        'question_text': 'Misanthrope : Humanity',
        'option_a': 'Chauvinist : Patriot', 'option_b': 'Misogynist : Women', 'option_c': 'Agnostic : God', 'option_d': 'Witch : Magic',
        'correct_answer': 'B',
        'explanation': "A 'Misanthrope' is a person who hates humanity, similarly a 'Misogynist' is a person who hates women."
    },
    154: {
        'question_text': "'Celsius' is related to 'Temperature' in the same way as 'Metre' is related to",
        'option_a': 'Depth', 'option_b': 'Square', 'option_c': 'Tall', 'option_d': 'Kilometer',
        'correct_answer': 'C',
        'explanation': "'Celsius' is the unit of measurement of 'Temperature', similarly 'Metre' is the unit of measurement of 'Tall' (height/length)."
    },
    155: {
        'question_text': "'Seed' is related to 'Fruit' in the same way as 'Fruit' is related to",
        'option_a': 'Tree', 'option_b': 'Branch', 'option_c': 'Flower', 'option_d': 'Petal',
        'correct_answer': 'A',
        'explanation': "'Seed' produces 'Fruit', in the same way 'Fruit' is produced by a 'Tree'."
    }
}

for q in questions:
    num = q['question_number']
    if num in curated_fixes:
        for k, v in curated_fixes[num].items():
            q[k] = v
            
    # Clean general punctuation
    txt = q['question_text']
    txt = re.sub(r'\[.*?\]', '', txt).strip()
    txt = re.sub(r'\s*::\s*', ' :: ', txt)
    txt = re.sub(r'\s*:\s*:\s*', ' :: ', txt)
    txt = re.sub(r'([a-zA-Z0-9\?])\s*:\s*([a-zA-Z0-9\?])', r'\1 : \2', txt)
    # clean trailing colons
    if txt.endswith(' :') or txt.endswith(' : :') or txt.endswith(' ::'):
        txt = re.sub(r'\s*:+', '', txt).strip()
    txt = re.sub(r'\s+', ' ', txt).strip()
    q['question_text'] = txt
    
    # Strip any exam tags from options
    for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
        val = q[opt_k]
        val = re.sub(r'\[.*?\]', '', val).strip()
        val = re.sub(r'\s+', ' ', val).strip()
        q[opt_k] = val

with open('reasoning_analogy_155_verified.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Saved reasoning_analogy_155_verified.json successfully!")
