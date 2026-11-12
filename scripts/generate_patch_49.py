import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Verified correct answers for all 100 questions of Paper 49
verified_answers = {
    1: ("A", "Mirror reflects images; a clock displays time."),
    2: ("C", "Since Kochi was not on the 10th and Hyderabad preceded Chennai, Chennai must be on the 10th (if Chennai were on 8th, Kochi would be forced to the 10th)."),
    3: ("C", "Alphabet position of W is 23."),
    4: ("C", "Words 'things' and 'time' cannot be uniquely isolated from {nine, one, six}, and 'light' can be either eight or four, so code cannot be determined."),
    5: ("C", "Perimeter 2(L+B) = 60 => 18 + B = 30 => B = 12 cm."),
    6: ("A", "Remaining fraction is 1 - 1/3 - 1/3 = 1/3; 1/3 * 90 km = 30 km."),
    7: ("A", "Differences double each step (+3, +6, +12, +24, +48): 52 + 48 = 100."),
    8: ("C", "From floor arrangement (Manu:10, Kiran:9, Hira:8, Chandu:7, Balu:6, Amu:5, Sonu:4, Ramu:3, Geetha:2, Janu:1), exactly 5 persons live between Geetha and Hira."),
    9: ("C", "From Y * X # F % L, F is the father of X, Y, and L; since Y is female, Y is the sister of L."),
    10: ("A", "Each letter shifts +8: B(2)+8=J(10), D(4)+8=L(12); thus C(3)+8=K(11), E(5)+8=M(13) gives KM."),
    11: ("D", "Old is to Ancient as New is to Modern (degree of intensity/synonym)."),
    12: ("B", "Pattern multiplies by 0.5, 1.5, 2.5, 3.5, 4.5 (12x0.5=6, 6x1.5=9, 9x2.5=22.5...), so 9 is the wrong term and should be 6."),
    13: ("A", "Each letter shifts +1: L->M, E->F, A->B, F->G gives MFBG."),
    14: ("A", "AP with first term a=1.2 and common difference d=0.3; 5th term = a + 4d = 1.2 + 1.2 = 2.4."),
    15: ("A", "Each letter shifts +1: I->J, F->G, B->C, S->T, U->V gives JGCTV."),
    16: ("A", "Odd positions remain unchanged while even positions advance by +1: ACHIEVEMENT becomes ADHJEWENEOT."),
    17: ("C", "Pattern is Row 1 + Row 2*(Row 2 - 1) = Row 3: 9 + 4*(3) = 9 + 12 = 21."),
    18: ("A", "The combination 'SPT' occurs exactly 2 times in SPTSPTSPPTST."),
    19: ("C", "When TRIANGLE is arranged in reverse alphabetical order (T R N L I G E A), letters T, R, and G (3 letters) remain at their original positions."),
    20: ("B", "S is father of U and U is mother of V and T, making S the maternal grandfather of T."),
    21: ("D", "Pairs follow n*(n+1): 61*62=3782, 53*54=2862, 47*48=2256, but 39*40=1560 != 1568."),
    22: ("B", "Emotional intelligence and leadership require taking responsibility publicly to the client and addressing communication gaps privately with the team."),
    23: ("A", "Introducing affordable express services for quick repairs attracts steady daily foot traffic and increases volume."),
    24: ("B", "Mitigating risk does not eliminate rainfall dependency completely, nor does it imply all traditional crops are obsolete; hence neither conclusion follows."),
    25: ("A", "Mandating rainwater harvesting assumes it is effective to replenish groundwater; it does not assume existing buildings already have it."),
    26: ("C", "Generosity in the World Happiness Report is measured by willingness/propensity to donate to charity."),
    27: ("B", "PM2.5 denotes fine particulate matter with an aerodynamic diameter of 2.5 micrometers or less."),
    28: ("B", "The GSAT satellite series consists of India's indigenously developed communication satellites."),
    29: ("B", "ISRO's collaboration with the private sector fosters innovation, investment, and market expansion."),
    30: ("C", "Charminar exemplifies Indo-Islamic Deccani architecture integrating Islamic arches with Hindu motifs and floral ornaments."),
    31: ("B", "The Indian Ocean contains vital sea lines of communication critical for global trade routes."),
    32: ("C", "The Harrod-Domar growth model states that economic growth rate is determined by the interaction of the savings rate and capital-output ratio (investment)."),
    33: ("A", "Sri Lankan author Shehan Karunatilaka won the 2022 Booker Prize for 'The Seven Moons of Maali Almeida'."),
    34: ("C", "The first National Kho-Kho Championship was held in 1959-60 in Vijayawada, Andhra Pradesh."),
    35: ("C", "The Deo Surya Mandir Mela is associated with the ancient Deo Sun Temple in Aurangabad, Bihar."),
    36: ("B", "The Age of Consent Act of 1891 raised the age of consent/minimum legal marriage age for girls from 10 to 12 years."),
    37: ("A", "Dr. Subrahmanyam Jaishankar has served as the Minister of External Affairs of India since May 2019."),
    38: ("B", "Manu Bhaker became the first Indian woman to win an Olympic shooting medal at the 2024 Paris Olympics."),
    39: ("B", "Statement 2 is incorrect because National Waterways are primarily designated for domestic inland cargo and passenger transit, not foreign trade."),
    40: ("C", "When a player is the last to touch a ball going out of bounds, possession is awarded to the opposing team at the nearest boundary line."),
    41: ("C", "K.K. Shailaja's memoir 'My Life as a Comrade' was co-authored with Manju Sara Rajan."),
    42: ("C", "The Logistics Performance Index (LPI) is an interactive benchmarking tool published by the World Bank Group."),
    43: ("A", "Article 324 vests the superintendence, direction, and control of elections in the Election Commission of India."),
    44: ("A", "Article 123 empowers the President to promulgate Ordinances during the recess of Parliament."),
    45: ("C", "Mercury and Venus are the only two planets in the solar system that have no natural satellites (moons)."),
    46: ("A", "Jet streams are fast-flowing air currents in the upper atmosphere/tropopause, not at low altitudes near Earth's surface."),
    47: ("C", "The Vahana (mount) of the presiding deity is placed on the axial line directly facing and just before the Sanctum Sanctorum (Garbhagriha)."),
    48: ("C", "NCERT notes that the 1991 economic reforms constrained the growth of public expenditure especially in social sectors (education, health, and rural development)."),
    49: ("A", "Total resistance = 9 Ω; Current I = 12/9 = 4/3 A; Power in 6 Ω resistor = I²R = (16/9)*6 = 32/3 ≈ 10.7 W."),
    50: ("B", "At 18 breaths per minute, total breaths in 2 hours (120 minutes) = 18 * 120 = 2160."),
    51: ("C", "Volume of a hemisphere is (2/3)πr³ = (2/3)π(6)³ = 144π cm³."),
    52: ("D", "Arc length = (θ/360) * 2πr = (60/360) * 2 * (22/7) * 21 = 22 cm."),
    53: ("C", "Slant height l = √(3²+4²) = 5 cm; Total surface area = πr(r + l) = (22/7)*3*8 = 528/7 ≈ 75.42 cm²."),
    54: ("C", "Curved surface area = πrl = (22/7)*7*25 = 550 cm²; Total cost = 550 * ₹2.50 = ₹1375."),
    55: ("A", "tan A = √(sec²A - 1) = √((13/12)² - 1) = √(25/144) = 5/12."),
    56: ("B", "Using identity (a³ - b³)/(a² + ab + b²) = a - b where a = 1.5, b = 0.5: 1.5 - 0.5 = 1."),
    57: ("B", "0.48 R = 0.64 M => R = 4M/3; (R - 480)/M = 4/5 yields R = 1200, so Mohit's income M = (3/4)*1200 = ₹900."),
    58: ("B", "Profit ratio = (7 * 7) / (8 * t) = 49 / 40 => 8t = 40 => t = 5 months."),
    59: ("A", "Let total voters be V; 0.55V - (0.90V - 150 - 0.55V) = 1100 => 0.20V + 150 = 1100 => V = 4750."),
    60: ("B", "Additional interest = P * 4 * 2 / 100 = 480 => P = ₹6,000; SI at 10% for 5 years = (6000 * 10 * 5)/100 = ₹3,000."),
    61: ("A", "Regular hexagon side a = 10 cm; Area = 6 * (√3/4)*10² = 150√3 cm²."),
    62: ("C", "15 CP = 20 SP => SP/CP = 3/4 => Loss% = (1 - 3/4)*100% = 25%."),
    63: ("D", "Rate(A+B+C) = 1/30 + 1/120 = 1/24; Rate(B+C) = 1.5*Rate(A) => Rate(A) = 1/60; Rate(B) = 1/30 - 1/60 = 1/60, so B takes 60 days."),
    64: ("D", "MP = 880 / 0.80 = 1100; Without discount SP = 1100 gives 10% profit => CP = 1100 / 1.10 = ₹1000."),
    65: ("D", "sin A + cos A = 4/3 => 1 + 2 sin A cos A = 16/9 => sin A cos A = 7/18; tan A + cot A = 1/(sin A cos A) = 18/7."),
    66: ("D", "x² + 1/x² = (x - 1/x)² + 2 = (√5)² + 2 = 7."),
    67: ("D", "If x = 2 + √3, then 1/x = 2 - √3; x + 1/x = 4."),
    68: ("A", "Interior - Exterior = 108° and I + E = 180° => E = 36°; Number of sides n = 360/36 = 10."),
    69: ("C", "Area ratio = (BC/EF)² => 4/9 = (9/EF)² => 2/3 = 9/EF => EF = 13.5 cm."),
    70: ("D", "Circumference 34π => radius r = 17 cm; Half-chord = 8 cm; Distance from center = √(17² - 8²) = 15 cm."),
    71: ("A", "Tangent length = r / tan(120°/2) = 4 / tan(60°) = 4/√3 cm."),
    72: ("C", "Distance between centers (0,0) and (a,0) is |a|, which is strictly between |R1 - R2| = 0 and R1 + R2 = 2|a|; hence the circles intersect at two distinct points."),
    73: ("B", "Minute hand moves 2π radians in 60 min (π/30 rad/min); (7π/6) / (π/30) = 35 minutes."),
    74: ("C", "y³ + 1/y³ = (y + 1/y)³ - 3(y + 1/y) = 18³ - 3(18) = 5832 - 54 = 5778."),
    75: ("C", "After removing 20L, milk is (7/10)(V-20) and water is (3/10)(V-20)+20; equating ratio to 7/5 gives V = 120 litres."),
    76: ("A", "Correct spelling is 'conscientious'."),
    77: ("A", "Correct spelling is 'proposal'."),
    78: ("D", "Incorrectly spelled word is 'Qintessential' (correct: Quintessential)."),
    79: ("B", "The logical and grammatical sentence order is RSPQ."),
    80: ("B", "Comparing two entities requires the comparative degree 'more profound'."),
    81: ("A", "The standard English collocation is 'accepted the responsibility'."),
    82: ("B", "The grammatically correct and coherent order is RPQS."),
    83: ("B", "The noun 'excellence' is erroneous after adverb 'extremely'; it should be the adjective 'excellent'."),
    84: ("C", "'Advance' denotes forward movement, progress, or prior timing, but not 'special benefits'."),
    85: ("B", "The non-restrictive phrase modifies the noun 'Theory', functioning as an adjective phrase."),
    86: ("B", "Epistemological pertains to epistemology, the philosophical study and theory of knowledge."),
    87: ("B", "In narrative past tense, the correct simple past verb form is 'became'."),
    88: ("B", "'Anomalies' means departures or deviations from what is standard, normal, or expected."),
    89: ("C", "The passage explicitly highlights the failure to explain the singularity and reconcile quantum mechanics with general relativity."),
    90: ("B", "The antonym of 'Quiescent' (dormant, inactive) is 'Active'."),
    91: ("B", "'Hoist with one's own petard' means to be harmed by one's own scheme or plot."),
    92: ("B", "'Rock the boat' means to disturb the balance or upset a stable situation."),
    93: ("C", "The antonym of 'Pellucid' (translucently clear) is 'Murky'."),
    94: ("A", "The synonym of 'Obstreperous' (unruly, noisy, difficult to control) is 'Unruly'."),
    95: ("A", "'Ephemeral' is the one-word substitute for lasting for a very short time."),
    96: ("D", "Passive form of continuous perfect modal 'should have been following' is 'should have been being followed'."),
    97: ("A", "Active voice conversion of 'The operation had been planned to be executed at dawn by the strike team' is 'The strike team had planned to execute the operation at dawn'."),
    98: ("A", "Active voice structure is best rendered as 'It is believed that no instruction was followed correctly by the staff'."),
    99: ("C", "Indirect speech for proposal/suggestion 'Rahul said, \"Let us go for a walk\"' is 'Rahul suggested that we should go for a walk'."),
    100: ("B", "The coherent paragraph flow is 2 (topic) -> 3 (explanation of programs) -> 1 (result on employees) -> 4 (corporate implementation), which is order 2-3-1-4.")
}

with open('scripts/paper_inputs/paper_49.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

changes = []
section_counts = {
    "Reasoning (Q1-25)": 0,
    "General Awareness (Q26-50)": 0,
    "Quantitative Aptitude (Q51-75)": 0,
    "English Comprehension (Q76-100)": 0
}

for q in questions:
    qn = q['question_number']
    qid = q['id']
    old_ans = q['correct_answer']
    new_ans, reason = verified_answers[qn]
    
    if old_ans != new_ans:
        changes.append({
            "question_number": qn,
            "id": qid,
            "old_answer": old_ans,
            "new_answer": new_ans,
            "reason": reason
        })
        if 1 <= qn <= 25:
            section_counts["Reasoning (Q1-25)"] += 1
        elif 26 <= qn <= 50:
            section_counts["General Awareness (Q26-50)"] += 1
        elif 51 <= qn <= 75:
            section_counts["Quantitative Aptitude (Q51-75)"] += 1
        elif 76 <= qn <= 100:
            section_counts["English Comprehension (Q76-100)"] += 1

patch_data = {
    "paper_id": 49,
    "title": "SSC CGL 2026 Tier-I (Held On 12 October 2026 Shift 2)",
    "total_questions": len(questions),
    "changes_count": len(changes),
    "changes": changes
}

patch_path = os.path.join("scripts", "verified_patches", "patch_paper_49.json")
with open(patch_path, 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, indent=2, ensure_ascii=False)

print(f"Patch successfully generated at {patch_path}")
print(f"Total questions: {len(questions)}")
print(f"Total changes: {len(changes)}")
print("Section-wise breakdown of changes:")
for sec, cnt in section_counts.items():
    print(f"  - {sec}: {cnt}")

print("\nList of all changed questions:")
for ch in changes:
    print(f"  Q{ch['question_number']:02d} (ID: {ch['id']}): {ch['old_answer']} -> {ch['new_answer']} | {ch['reason']}")
