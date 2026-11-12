import json
import os

with open(r'c:\ssczone\scripts\paper_inputs\paper_36.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Proposed answers map: question_number -> (verified_answer, reason)
verified = {}

# Q1-Q25: Reasoning
verified[1] = ('A', 'Exact address match with correct pincode 110052.')
verified[2] = ('D', "Bhopal is 15th July, Nagpur is 14th, Raipur is 16th, and Jabalpur is 1 day before Raipur (15th July).")
verified[3] = ('A', 'Operation is division: 20 / 5 = 4.')
verified[4] = ('D', 'Cube of 113 is 113^3 = 1,442,897.')
verified[5] = ('B', 'Square of 18 is 18^2 = 324.')
verified[6] = ('B', '35 / (5 + w) = 3/1 => 3w = 20 => w = 6.67 liters.')
verified[7] = ('B', 'All numbers in B (11, 13, 17, 19) are prime numbers, whereas 9 in D is composite.')
verified[8] = ('C', 'Both judgments 1 and 2 follow as valid implications of public service digitalization.')
verified[9] = ('C', 'Letter advances +2 (J+2=L) and number advances +2 (9+2=11), giving L11.')
verified[10] = ('B', 'Alphabetical position code: B=2, E=5, A=1, R=18.')
verified[11] = ('D', 'Both inferences I and II directly follow from the stated failure of irrigation/subsidies and erratic weather.')
verified[12] = ('C', 'Pattern is n^2 + 1; 6^2 + 1 = 37.')
verified[13] = ('C', 'Each letter is shifted by -2; HOSPITAL becomes FMQNGRYJ.')
verified[14] = ('D', 'Chief Justice belongs to the judiciary, while the other three are political executive offices.')
verified[15] = ('A', 'Completes the matrix pattern row/column relation.')
verified[16] = ('A', 'Grandfather U (contractor) and grandmother S (housewife) form the senior married couple.')
verified[17] = ('D', 'The AP with common difference 6 requires 243 + 6 = 249, not 248.')
verified[18] = ('C', 'NOTATION requires two Ts, two Os, and two Ns, which exceed the letter counts in EDUCATION.')
verified[19] = ('A', 'Rearranging OCRHNOLOGY forms CHRONOLOGY.')
verified[20] = ('A', 'Exact match with the given Lucknow address.')
verified[21] = ('A', 'Internet being an integral part of life implies life is difficult to imagine without it; debate necessity is unsupported.')
verified[22] = ('B', 'Both recommendations directly address appointing domain experts in finance over general bureaucrats.')
verified[23] = ('A', 'Student X meets both the academic (92% >= 90%) and income criteria (< Rs. 2L).')
verified[24] = ('A', 'From All pens are laptops and All laptops are computers, only All pens are computers follows.')
verified[25] = ('C', 'Mandating personal investment education assumes early exposure fosters better adult financial decisions.')

# Q26-Q50: General Awareness
verified[26] = ('B', 'Babur established the Timurid (Mughal) dynasty in India; paper currency was not introduced by him.')
verified[27] = ('B', 'Neora Valley National Park is located in Kalimpong district, West Bengal.')
verified[28] = ('C', 'Inductance is measured in Henry; magnetic flux density is in Tesla, flux in Weber, charge in Coulombs.')
verified[29] = ('B', 'Centrifugal force resulting from Earth rotation creates the equatorial bulge.')
verified[30] = ('B', 'Solar flares release X-rays/EUV radiation that cause ionospheric electron density fluctuations.')
verified[31] = ('C', 'The bauxite-rich Patlands of Lohardaga are located in Jharkhand.')
verified[32] = ('A', 'Admiral Dinesh Kumar Tripathi assumed office as the 26th Chief of Naval Staff.')
verified[33] = ('C', 'Dr. T. V. Somanathan was appointed Cabinet Secretary of India in August 2024.')
verified[34] = ('C', 'Attuvela Mahotsavam is the famous annual water carnival celebrated at Elankavu Bhagavathy Temple, Kerala.')
verified[35] = ('C', 'Modern academic consensus attributes the decline of the Indus civilization to a combination of climatic, environmental, and socio-economic factors.')
verified[36] = ('B', 'PM-PRANAM scheme aims to promote balanced and sustainable fertilizer use and reduce chemical fertilizers.')
verified[37] = ('B', 'PM-KISAN provides income support of Rs. 6,000 per year in three equal installments.')
verified[38] = ('B', 'Nandini Sidha Reddy won the Sahitya Akademi Award for his Telugu poetry collection Animesha.')
verified[39] = ('A', 'Dr. Jitendra Kumar Soni authored the Rajasthani short story collection Bharkhama.')
verified[40] = ('B', 'Under BNS (and IPC s. 88), acts done in good faith for a patient benefit with consent do not constitute an offence.')
verified[41] = ('B', 'Jaya Varma Sinha became the first woman Chairperson and CEO of the Railway Board in September 2023.')
verified[42] = ('B', 'Dr. P. K. Mishra was re-appointed / continued as Principal Secretary to the Prime Minister in June 2024.')
verified[43] = ('C', 'Both statements correctly describe the conventional stylistic divisions of Indo-Islamic architecture.')
verified[44] = ('B', 'Alcohol and hazardous chemicals remained under compulsory licensing after the 1991 economic reforms.')
verified[45] = ('B', 'Narendra Modi Stadium in Ahmedabad hosted the tournament final.')
verified[46] = ('C', 'Adult literacy was replaced by schooling years because it failed to adequately capture differences in educational attainment.')
verified[47] = ('A', 'The Business Reforms Action Plan (BRAP) is coordinated by DPIIT (Department for Promotion of Industry and Internal Trade).')
verified[48] = ('D', 'The Central Inspection System under BRAP introduces synchronized, risk-based inspections.')
verified[49] = ('B', 'Pollinators exemplify the vital ecological interdependence connecting forest ecosystems and agricultural production.')
verified[50] = ('B', 'Economic scarcity arises because unlimited human wants exceed limited available resources.')

# Q51-Q75: Quantitative Aptitude
verified[51] = ('D', 'Largest angle = 120 deg; average interior angle = 108 deg; (n-2)*180/n = 108 yields n = 5.')
verified[52] = ('B', 'Equilateral inradius r = a / (2*sqrt(3)) = 6 / (2*sqrt(3)) = sqrt(3) ≈ 1.73 cm.')
verified[53] = ('A', 'Substituting x=1, y=2 gives 2(1) + 3(2) = 8, so k = 8.')
verified[54] = ('A', 'Perpendicular line slope is the negative reciprocal: -1 / (a/b) = -b/a.')
verified[55] = ('B', 'Angle 2pi/3 = 120 deg lies in the Second Quadrant (Quadrant II).')
verified[56] = ('C', '144p^2 - 72p + k = (12p - 3)^2 requires adding 3^2 = 9.')
verified[57] = ('B', '(a^3 - b^3)/(a^2 + ab + b^2) = a - b = 0.65 - 0.13 = 0.52.')
verified[58] = ('B', '(2026 + x) + (2026 - x) = 2 * 2026 = 4052.')
verified[59] = ('B', 'Increase in interest = P * (2 * 3) / 100 = 540 => P = 540 * 100 / 6 = Rs. 9,000.')
verified[60] = ('B', 'A = 2500 * (1.1)^4 = 2500 * 1.4641 = Rs. 3660.25.')
verified[61] = ('C', 'Circumference = (22/7)*1.05 = 3.3 m; distance = 40 * 3.3 = 132 m.')
verified[62] = ('D', 'Angle at major arc = 180 deg - 160 deg = 20 deg; angle at centre = 40 deg; tangent angle PAQ = 180 deg - 40 deg = 140 deg.')
verified[63] = ('C', 'Using Pythagorean triplet (20, 21, 29), sin theta = 20/29.')
verified[64] = ('D', 'X = sqrt((10 + 3*sqrt(11))^2) = 10 + 3*sqrt(11); X + 1/X = 2 * 10 = 20.')
verified[65] = ('B', 'x + 60 = 85 - 4x => 5x = 25 => x = 5; angle ABC = 5 + 60 = 65 deg.')
verified[66] = ('B', 'Area ratio equals (DC/BC)^2 = (b / (b + c))^2 by Angle Bisector Theorem and similar triangles.')
verified[67] = ('B', 'TCT length = sqrt(d^2 - (r1 + r2)^2) = sqrt(17^2 - 14^2) = sqrt(93) cm.')
verified[68] = ('B', 'The given angles are 60 deg and 45 deg, so the third angle is 180 deg - 105 deg = 75 deg.')
verified[69] = ('A', 'sin A * cos B = (4/5) * (5/13) = 20/65.')
verified[70] = ('D', 'tan P = 1/sqrt(3) => P = 30 deg => R = 60 deg => sin R = sqrt(3)/2.')
verified[71] = ('D', 'a^2 + b^2 = 20^2 - 2(84) = 232; a^4 + b^4 = 232^2 - 2(84^2) = 53824 - 14112 = 39712.')
verified[72] = ('A', 'Distance OP = sqrt(13^2 + 84^2) = sqrt(169 + 7056) = sqrt(7225) = 85 cm.')
verified[73] = ('A', 'Initial total = 900,000; remaining total = 585,000 for 27 families; new avg = 21,666.67; decrease = 13.33%.')
verified[74] = ('C', 'CP = 100, SP = 125, MP = 125 / 0.80 = 156.25; markup is 56.25%.')
verified[75] = ('A', 'sqrt(4 + 2*sqrt(3)) = sqrt((sqrt(3) + 1)^2) = sqrt(3) + 1.')

# Q76-Q100: English Comprehension
verified[76] = ('A', 'Correct passive transformation preserving original meaning and grammatical structure.')
verified[77] = ('B', 'Corpus luteum secretes progesterone to stabilize the endometrial architecture.')
verified[78] = ('A', 'Third-person singular subject (the menstrual cycle) takes the singular verb exhibits.')
verified[79] = ('B', 'Desquamation means shedding of the surface epithelial layer.')
verified[80] = ('A', 'Precipitous in this context means abrupt or steep.')
verified[81] = ('A', 'Past perfect passive had been shattered correctly converts to past perfect active had shattered.')
verified[82] = ('C', 'Panacea means a universal remedy or universal cure for all diseases.')
verified[83] = ('B', 'Conviction denotes strong belief or certainty.')
verified[84] = ('A', 'Tacit means implied without being spoken; its antonym is expressed.')
verified[85] = ('A', 'Pupil (part of the eye) is the homonym of pupil (student in class).')
verified[86] = ('B', 'Simple past passive was announced converts to simple past active announced.')
verified[87] = ('C', 'Correct coherent arrangement is C-B-D-A: a new desalination plant was inaugurated by the Prime Minister in Tamil Nadu.')
verified[88] = ('A', 'Arrangement C-B-D-A forms a coherent sentence starting with the temporal modifier in recent years.')
verified[89] = ('C', 'Perserverance is incorrectly spelled; the correct spelling is perseverance.')
verified[90] = ('B', 'Comparative degree easier is required with than.')
verified[91] = ('B', 'Put the cart before the horse idiomatically means reversing the logically proper sequence.')
verified[92] = ('B', 'Break new ground means to innovate or pioneer something new.')
verified[93] = ('A', 'Stationary means unmoving/fixed, fitting the context of a stopped vehicle.')
verified[94] = ('A', 'The noun evasion collocated with responsibility takes the preposition of (evasion of responsibility).')
verified[95] = ('C', 'Omission of contextual variables meaningfully fits the flaw that marred the conclusion.')
verified[96] = ('B', 'A person who engages in espionage is defined as a spy.')
verified[97] = ('C', 'With silent steps is most appropriately and concisely replaced by the adverb silently.')
verified[98] = ('A', 'Procedural chronological sequence is 2 (first) -> 1 (next) -> 4 (then) -> 3 (after).')
verified[99] = ('D', 'Logical HR workflow starts with induction (1), background records (3), training (2), and placement (4).')
verified[100] = ('A', 'Train in Option A is used as a verb (to exercise), which is a homonym of the noun train (railway vehicle).')

changes = []
for q in questions:
    qnum = q['question_number']
    qid = q['id']
    old_ans = q['correct_answer']
    new_ans, reason = verified[qnum]
    if old_ans != new_ans:
        changes.append({
            'question_number': qnum,
            'id': qid,
            'old_answer': old_ans,
            'new_answer': new_ans,
            'reason': reason
        })

patch_data = {
    "paper_id": 36,
    "title": "SSC CGL 2026 Tier-I (Held On 7 October 2026 Shift 1)",
    "total_questions": len(questions),
    "changes_count": len(changes),
    "changes": changes
}

os.makedirs(r'c:\ssczone\scripts\verified_patches', exist_ok=True)
patch_path = r'c:\ssczone\scripts\verified_patches\patch_paper_36.json'
with open(patch_path, 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {patch_path} with {len(changes)} changes.")
