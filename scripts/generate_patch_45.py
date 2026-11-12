import json
import os

with open(r'c:\ssczone\scripts\paper_inputs\paper_45.json', encoding='utf-8') as f:
    questions = json.load(f)

# Map question_number to question object
q_by_num = {q['question_number']: q for q in questions}

changes_definitions = [
    # General Awareness
    (42, 'A', 'C', 'Under BNS Sec 14 / IPC Sec 76, acts done under a bona fide mistake of fact in good faith are protected from criminal liability.'),
    (43, 'A', 'C', 'Under Article 1, India is an indestructible Union of destructible states; states have no constitutional right to secede.'),
    (44, 'A', 'B', 'The 1991 economic reforms promoted market-based pricing, industrial deregulation, and industrial dereservation.'),
    (45, 'A', 'C', 'India approached the International Monetary Fund (IMF) and World Bank for balance-of-payments bailout in 1991.'),
    (46, 'A', 'B', 'Fertility, mortality, and migration are the three primary demographic determinants of population size and composition.'),
    (49, 'A', 'C', 'Sardar Vallabhbhai Patel played the major organizational leadership role alongside Mahatma Gandhi in the 1918 Kheda Satyagraha.'),
    (50, 'A', 'C', 'Fish are natural predators of mosquito larvae; their decline directly reduces predation pressure, causing mosquito populations to surge.'),

    # Quantitative Aptitude
    (54, 'A', 'B', 'Profit ratio (C_A*7)/(C_B*9) = 7/10 => C_A/C_B = 9/10; difference = 1 unit = ₹1,800, so total capital = 19 * 1800 = ₹34,200.'),
    (64, 'B', 'D', 'Volume of sphere / volume of cone = [(4/3)*pi*10^3] / [(1/3)*pi*(2.5)^2*8] = 4000 / 50 = 80 cones.'),
    (66, 'A', 'B', '999^2 - 998^2 = (999 - 998)(999 + 998) = 1 * 1997 = 1997.'),
    (68, 'A', 'B', 'tan A = m/1 => adjacent = 1, hypotenuse = sqrt(1 + m^2), therefore cos A = 1/sqrt(1 + m^2).'),
    (69, 'A', 'C', 'Net emptying rate: x/8 - (15-x)/6 = -1/6 => 3x - 4(15-x) = -4 => 7x = 56 => x = 8 inlets, so outlet pipes = 15 - 8 = 7.'),
    (71, 'A', 'D', 'sin^2 65° = cos^2 25°, hence sin^2 25° + sin^2 65° = sin^2 25° + cos^2 25° = 1.'),
    (72, 'A', 'B', 'y^3 + 1/y^3 = (y + 1/y)^3 - 3(y + 1/y) = 17^3 - 3(17) = 4913 - 51 = 4862.'),
    (73, 'A', 'B', 'a^2 + b^2 = (a + b)^2 - 2ab = 22^2 - 2(85) = 484 - 170 = 314.'),
    (75, 'A', 'C', 'Squaring gives a + sqrt(b) = (x + y) + 2*sqrt(xy); equating rational parts gives x + y = a = 5.'),

    # English Comprehension
    (83, 'B', 'C', "A person who manages money wisely and avoids unnecessary expense is 'thrifty'; 'prodigal' is an antonym meaning wasteful."),
    (86, 'B', 'C', "The idiom 'to take with a grain of salt' means to maintain a cautious or skeptical attitude toward the truth."),
    (87, 'C', 'B', "The correct spelling of the word meaning disguise or concealment is 'Camouflage'."),
    (88, 'B', 'A', "The standard English idiom is 'with great reluctance'."),
    (89, 'A', 'B', "The noun 'ability' takes an infinitive complement ('ability to make'), making part 2 ('of making') grammatically erroneous."),
    (90, 'A', 'D', "'Funding' is an uncountable noun and cannot take the plural form 'fundings', making part 4 erroneous.")
]

changes_list = []
for qnum, old_ans, new_ans, reason in changes_definitions:
    q = q_by_num[qnum]
    assert q['correct_answer'] == old_ans, f"Expected {old_ans} for Q{qnum}, got {q['correct_answer']}"
    changes_list.append({
        "question_number": qnum,
        "id": q['id'],
        "old_answer": old_ans,
        "new_answer": new_ans,
        "reason": reason
    })

# Sort changes by question_number
changes_list.sort(key=lambda x: x['question_number'])

patch_data = {
    "paper_id": 45,
    "title": "SSC CGL 2026 Tier-I (Held On 10 October 2026 Shift 1)",
    "total_questions": 100,
    "changes_count": len(changes_list),
    "changes": changes_list
}

os.makedirs(r'c:\ssczone\scripts\verified_patches', exist_ok=True)
patch_path = r'c:\ssczone\scripts\verified_patches\patch_paper_45.json'

with open(patch_path, 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {patch_path} with {len(changes_list)} changes!")
