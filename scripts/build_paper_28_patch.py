import json

# Full dictionary of verified correct answers for Paper 28
# Format: qnum: (correct_answer, reason)

audit_results = {
    1: ("A", "Interchanging × and ÷ gives 15 + 9 - 6 ÷ 3 × 2 = 15 + 9 - 4 = 20."),
    2: ("B", "Pattern is n³ : (n+1)³ + 1; for 27 (3³), next is 4³ + 1 = 65."),
    3: ("A", "The only son of man's mother is the man himself; his daughter is his daughter."),
    4: ("D", "None of the given conclusions logically follow from the statements."),
    5: ("B", "Pattern is × 7 + 2; 457 × 7 + 2 = 3201."),
    6: ("A", "Alphabetical order of PRINTER is EINPRRT; 0 letters retain original positions."),
    7: ("B", "Column rule is (Row 1 × Row 2) / Row 3 = Row 4; (3 × 2) / 1 = 6."),
    8: ("D", "In S * P + Q, S is father of P and P is brother of Q (male), so P is the son of S."),
    9: ("C", "F is husband of G and father of E, not the mother."),
    10: ("D", "Column 1 follows powers of 2 (2¹, 2², 2³, 2⁴ = 16)."),
    11: ("D", "For 6112, 6 × 2 = 12 ≠ 1 + 2 (and it has 4 digits instead of 3), so it is invalid."),
    12: ("A", "Letters shift by +4, -1, +4: S(+4)=W, Y(-1)=X, V(+4)=Z -> WXZ."),
    13: ("C", "Pattern is n : n² + n; for 13 it should be 13² + 13 = 182, not 186."),
    14: ("D", "The constructive administrative action is to engage residents positively and explain benefits."),
    15: ("A", "Letters shift by +7: U(+7)=B, 21(+7)=28, A(+7)=H -> B28H."),
    16: ("C", "All four conclusions follow from the given universal affirmative and negative statements."),
    17: ("C", "Only conclusion I follows because antibiotics are not harmless and some medicines are antibiotics."),
    18: ("B", "Interchanging + and - gives 16 + 8 ÷ 4 - 5 × 2 = 16 + 2 - 10 = 8."),
    19: ("B", "Neither conclusion follows from the given match statistics."),
    20: ("A", "Only Assumption I is implicit; one cannot assume financial institutions will definitely provide funding."),
    21: ("B", "Implementing smart precision farming systems yields the highest productivity gains."),
    22: ("B", "Clove is a flower bud; cinnamon is obtained from tree bark."),
    23: ("C", "Under the casing rule, M, O, Y are lowercase and N, D, A are uppercase, giving moNDAy."),
    24: ("C", "Splitting orders balances risk while giving the existing supplier time to rectify quality."),
    25: ("D", "In GSHR, G and S are not opposite letter pairs (G pairs with T)."),
    26: ("D", "The 2025 World Happiness Report included 147 countries in its rankings."),
    27: ("C", "Africa is located directly to the west of the Indian Ocean."),
    28: ("B", "A core feature of NDHM (ABDM) is creating a unique digital health ID (ABHA) for every citizen."),
    29: ("C", "NEP 2020 emphasizes critical thinking, creativity, and conceptual understanding over rote learning."),
    30: ("C", "Indian sprinter Hima Das is known as the 'Dhing Express' after her birthplace in Assam."),
    31: ("C", "The Singh Sisters are acclaimed Indian national basketball players."),
    32: ("D", "The 2017 Senior National Judo Championships took place at Jawaharlal Nehru Stadium in Chennai."),
    33: ("C", "Under BSA, conclusive proof is final and evidence to disprove it is inadmissible."),
    34: ("C", "Vijaya Rahatkar was appointed as the 9th Chairperson of the National Commission for Women."),
    35: ("A", "Mamata Banerjee was first sworn in as Chief Minister of West Bengal in May 2011."),
    36: ("B", "Pashupati is associated with the Indus Valley Civilization and later Hinduism, not the Rig Veda."),
    37: ("A", "Uttar Pradesh is the largest producer of sugarcane in India."),
    38: ("C", "The Charter Act of 1853 separated the legislative and executive functions of the Governor-General's Council."),
    39: ("B", "The Uttarakhand UCC covers marriage, divorce, and succession while explicitly exempting tribal communities."),
    40: ("A", "In Silappadikaram, the Pandyan capital city of Madurai was destroyed by fire due to Kannagi's curse."),
    41: ("B", "The Vice-President of India is covered under Part V (The Union) of the Constitution."),
    42: ("A", "The SI unit of electrical resistivity is the Ohm-meter (Ω·m)."),
    43: ("C", "A parliamentary law under Article 249 ceases to be in force six months after the resolution lapses."),
    44: ("A", "The growth of BPO in India is primarily driven by Globalisation."),
    45: ("D", "The standard of living dimension in HDI is measured by Gross National Income (GNI) per capita."),
    46: ("B", "The 1991 trade policy reforms aimed to enhance the international competitiveness of industrial production."),
    47: ("D", "Energy U = 1/2 C V²; doubling C and halving V yields U' = 1/2 (2C) (V/2)² = U/2."),
    48: ("B", "The economic liberalisation program was implemented during the Eighth Five-Year Plan (1992–1997)."),
    49: ("A", "Lord Canning introduced the portfolio system in the Governor-General's council in 1859."),
    50: ("B", "Anaerobic respiration in fatigued muscles results in the accumulation of lactic acid."),
    51: ("A", "Volume of right prism = Base Area × Height = 90 cm² × 20 cm = 1800 cm³."),
    52: ("A", "Sum of interior angles ratio = (7 - 2) × 180° : (9 - 2) × 180° = 5 : 7."),
    53: ("B", "Tower height h = 10 / (cot 30° - cot 60°) = 10 / (√3 - 1/√3) = 5√3 m."),
    54: ("C", "√0.16 + √0.81 + √1.69 + √0.0025 = 0.4 + 0.9 + 1.3 + 0.05 = 2.65."),
    55: ("B", "Centroid G divides median in 2:1 ratio; GD = PG / 2 = 15 / 2 = 7.5 cm."),
    56: ("C", "Sum of digits for 67215 is 6 + 7 + 2 + 1 + 5 = 21, which is divisible by 3."),
    57: ("B", "Ratio is A : B : C = (20×8) : (25×8) : (15×8) = 160 : 200 : 120 = 4 : 5 : 3."),
    58: ("B", "Compound interest rate = (1452 - 1320) / 1320 × 100% = 10%."),
    59: ("D", "360/n - 360/4n = 270/n = 9° gives n = 30 and 4n = 120 sides."),
    60: ("C", "Area of quadrant = (1/4)πr² = 121π/4 cm², so r² = 121 and r = 11 cm."),
    61: ("B", "Volume of cone = (1/3)πr²(7) = 588π => r² = 252 => r = 6√7 cm."),
    62: ("B", "SP_A = 4.8x, SP_B = 4.5x; difference 0.3x = 560 => Total CP = 9x = ₹16,800."),
    63: ("B", "3S - C = 5(S - C) => 2S = 4C => S = 2C; profit percentage = (2C - C)/C × 100% = 100%."),
    64: ("D", "Height h = 10 / (cot 30° - cot 60°) = 5√3 ≈ 5 × 1.732 = 8.66 m ≈ 8.7 m."),
    65: ("D", "With ∠A = 60° and ∠B = 50°, the side opposite ∠A is greater than side opposite ∠B, so BC > AC."),
    66: ("B", "(p² + 1) / (p² - 1) = (2p sec θ) / (2p tan θ) = sec θ / tan θ = 1 / sin θ = cosec θ."),
    67: ("D", "Volume ratio 64:125 => radius ratio 4:5 => surface area ratio (4/5)² = 16:25."),
    68: ("B", "Distance from orthocenter to vertex CF = 2R cos C; AB = 2R sin C; CF = AB => tan C = 1 => ∠ACB = 45°."),
    69: ("B", "Amount scales linearly with principal: 1,50,000 × (1,21,500 / 90,000) = ₹2,02,500."),
    70: ("A", "Efficiencies give 1m = 2w; remaining 130w work in 5 days needs 26w/day; 10w present, so 16w/day = 8 men."),
    71: ("D", "Q works for 4.5 days doing 9 out of 30 units of work; share = (9/30) × 52000 = Rs. 15,600."),
    72: ("A", "sin θ = cos(θ + 30°) => θ + θ + 30° = 90° => 2θ = 60° => θ = 30°."),
    73: ("A", "4a² + 20ab + 25b² = (2a + 5b)², so 25b² must be added to make a perfect square trinomial."),
    74: ("C", "(a - b)² = (a² + b²) - 2ab = 89 - 40 = 49 => |a - b| = 7."),
    75: ("C", "Rationalizing (√2 + 1) / (√2 - 1) gives (√2 + 1)² / (2 - 1) = 3 + 2√2."),
    76: ("B", "The direct speech form is: The players said, 'Will our coach return before the game?'"),
    77: ("D", "The original sentence rearrangement follows sequence PSRQ."),
    78: ("A", "Negative adverbial inversion requires: 'Rarely had one witnessed... nor was it...'"),
    79: ("A", "'Reading between the lines' means understanding the hidden or implied meaning."),
    80: ("B", "'write clear' is incorrect; the adverb 'clearly' should modify the verb 'write'."),
    81: ("C", "The logical flow of ideas follows the sequence 3-1-5-4-2."),
    82: ("C", "Peregrinate means to travel or wander; its antonym is stay."),
    83: ("B", "'Giving a false colouring to' means misrepresenting the facts."),
    84: ("B", "The correct medical spelling is Otorhinolaryngology."),
    85: ("D", "A person who flatters for personal gain is a sycophant."),
    86: ("B", "Pleasure derived from another person's misfortune is schadenfreude."),
    87: ("A", "Negative inversion with 'Not only' requires 'did he provide'."),
    88: ("A", "'Equipment' is an uncountable noun and cannot be used in the plural 'equipments'."),
    89: ("B", "The conjunction 'although' should not be paired with 'yet' in part (2)."),
    90: ("B", "Active 'Why did they cancel the meeting?' converts to passive 'Why was the meeting cancelled?'"),
    91: ("A", "Passive form is: 'Such modifications should not have been undergone by the proposal.'"),
    92: ("B", "The correct preposition with 'angry' when referring to people is 'with': 'angry with the students'."),
    93: ("B", "Direct speech for the conditional statement is: 'Had we practiced more, we might have won the tournament.'"),
    94: ("C", "In the phrase 'implicit trust', 'implicit' means unspoken or implied rather than stated."),
    95: ("A", "The grammatically and logically coherent sequence is 1-R-Q-S-P-6 (Option A: RQSP)."),
    96: ("C", "Laura's father hesitated because he expected Hughie to obtain a respectable income."),
    97: ("A", "Hughie gave the coin because the model's weak and miserable appearance awakened his sympathy."),
    98: ("D", "Hughie felt embarrassed because he imagined the wealthy baron would ridicule his foolish charity."),
    99: ("C", "The baron valued the gift because it was given sincerely under the belief that he was helpless."),
    100: ("D", "The coin represents sacrifice and sincere compassion, which the baron's gift recognizes.")
}

with open('c:/ssczone/scripts/paper_inputs/paper_28.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

changes = []
section_breakdown = {
    "Reasoning (Q1-25)": 0,
    "General Awareness (Q26-50)": 0,
    "Quantitative Aptitude (Q51-75)": 0,
    "English Comprehension (Q76-100)": 0
}

for q in questions:
    qnum = q['question_number']
    old_ans = q['correct_answer']
    new_ans, reason = audit_results[qnum]
    if old_ans != new_ans:
        changes.append({
            "question_number": qnum,
            "id": q['id'],
            "old_answer": old_ans,
            "new_answer": new_ans,
            "reason": reason
        })
        if qnum <= 25:
            section_breakdown["Reasoning (Q1-25)"] += 1
        elif qnum <= 50:
            section_breakdown["General Awareness (Q26-50)"] += 1
        elif qnum <= 75:
            section_breakdown["Quantitative Aptitude (Q51-75)"] += 1
        else:
            section_breakdown["English Comprehension (Q76-100)"] += 1

patch_data = {
    "paper_id": 28,
    "title": "SSC CGL 2026 Tier-I (Held On 1 October 2026 Shift 2)",
    "total_questions": len(questions),
    "changes_count": len(changes),
    "changes": changes
}

patch_path = 'c:/ssczone/scripts/verified_patches/patch_paper_28.json'
with open(patch_path, 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, ensure_ascii=False, indent=2)

print(f"Generated patch file at {patch_path}")
print(f"Total changes count: {len(changes)}")
print("Section-wise breakdown:")
for sec, cnt in section_breakdown.items():
    print(f"  {sec}: {cnt}")
