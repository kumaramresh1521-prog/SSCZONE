import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Input paper path
paper_path = r'c:\ssczone\scripts\paper_inputs\paper_50.json'
with open(paper_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Verified answers map: question_number -> (verified_answer, reason)
verified = {}

# ==========================================
# General Intelligence & Reasoning (Q1 - Q25)
# ==========================================
verified[1] = ('A', "Alphabetical positional value coding: P=16, Q=17, R=18, so S=19, T=20, U=21 gives 192021.")
verified[2] = ('C', "Both conclusions logically follow as mandatory implementation causes loss of benefits for non-holders and aims to identify all recipients.")
verified[3] = ('C', "Letter series advances by +2: A(+2) -> C(+2) -> E(+2) -> G(+2) -> I.")
verified[4] = ('D', "Letters coded by their alphabetical positions: P=16, A=1, G=7, E=5 gives 16-1-7-5.")
verified[5] = ('A', "Children who like only cake = Total liking cake (18) - liking both (10) = 8.")
verified[6] = ('A', "Only Chess = Total Chess (40) - [Tennis & Chess only (10) + Badminton & Chess only (5) + All three (10)] = 40 - 25 = 15.")
verified[7] = ('A', "Solving 5x - 3y = 27 and x + 2y = 12 yields y = 33/13 ≈ 2.54 and x = 90/13 ≈ 6.92.")
verified[8] = ('D', "Alternating pattern shifts (+7, +12, +7, +12): A(1)+7=H, B(2)+12=N, C(3)+7=J, D(4)+12=P produces HNJP.")
verified[9] = ('C', "Mayor is the head of an urban local self-government body, whereas the others are constitutional/executive heads at state and union levels.")
verified[10] = ('D', "Exact character-by-character match with the given address including abbreviations and pincode 500081.")
verified[11] = ('C', "The grid structure contains 51 squares in total.")
verified[12] = ('A', "In SECURE, only letter 'C' occupies its alphabetical position (3rd letter).")
verified[13] = ('A', "Letter positions: first letter +2 (G+2=I), second letter -1 (F-1=E), third letter +2 (M+2=O), resulting in IEO.")
verified[14] = ('B', "Option figure B correctly completes the symmetric pattern in figure (X).")
verified[15] = ('A', "Interchanging signs + and -, and numbers 4 and 6 gives 16 + 6 × 4 ÷ 2 - 8 = 16 + 12 - 8 = 20.")
verified[16] = ('B', "Professional workplace ethics requires promptly reporting the error to the manager with a corrected report prior to the leadership presentation.")
verified[17] = ('D', "Figure (X) is embedded inside alternative figure 4.")
verified[18] = ('A', "Only Assumption I is implicit because introducing coding aims to equip students for a tech-driven future job market.")
verified[19] = ('A', "Figure 'd' deviates from the geometric rotation/symmetry rules shared by the other four figures.")
verified[20] = ('A', "The geometric figure comprises exactly 36 triangles.")
verified[21] = ('A', "Figure 1 maintains the established rotation and element-inversion relationship.")
verified[22] = ('D', "Figure 3 correctly completes the proportional transformation.")
verified[23] = ('B', "Filling blanks with 'acac' forms the repeating pattern 'ccaccb' three times.")
verified[24] = ('D', "Figure (X) is embedded in alternative figure 3.")
verified[25] = ('C', "Number series has second differences +5, +7, +9, +11: first difference is 28 + 11 = 39, giving 80 + 39 = 119.")

# ==========================================
# General Awareness (Q26 - Q50)
# ==========================================
verified[26] = ('B', "Shortughai in northern Afghanistan was the Harappan trading colony established to procure lapis lazuli.")
verified[27] = ('C', "The chronological sequence of the Stone Age is Palaeolithic (Old), Mesolithic (Middle), and Neolithic (New Stone Age).")
verified[28] = ('B', "Khanazad in the Mughal nobility referred to hereditary nobles who were sons or close relatives of serving imperial amirs.")
verified[29] = ('C', "Article 53(1) of the Indian Constitution vests the executive power of the Union in the President of India.")
verified[30] = ('B', "Article 124 of the Constitution provides for the establishment, constitution, and composition of the Supreme Court of India.")
verified[31] = ('B', "Under Article 112, the official constitutional terminology for the Union Budget is 'Annual Financial Statement'.")
verified[32] = ('C', "The Charter Act of 1793 renewed the commercial monopoly and charter of the East India Company for twenty years.")
verified[33] = ('A', "Orogeny refers to the structural deformation of the lithosphere leading to the formation of mountain belts.")
verified[34] = ('B', "Under the World Anti-Doping Code, an eight-year ban signifies a second anti-doping rule violation (second offence).")
verified[35] = ('D', "Yemshe is the premier traditional harvest festival celebrated by the Pochuri tribe of Nagaland.")
verified[36] = ('B', "In association football, a yellow card serves as an official caution to a player for misconduct.")
verified[37] = ('A', "Matki is a traditional solo folk dance of the Malwa region of Madhya Pradesh; Karakattam is native to Tamil Nadu.")
verified[38] = ('A', "Jakari (or Jakdi) is an authentic traditional folk song genre sung by women in rural Haryana; Lavani belongs to Maharashtra.")
verified[39] = ('D', "The designated capacity-building scheme is designed to support and modernize Small and Medium Enterprises.")
verified[40] = ('B', "Ghazanfar Iqbal received the Sahitya Akademi Bal Sahitya Puraskar 2025 in Urdu for his book 'Qaumi Sitare'.")
verified[41] = ('A', "The fundamental strategic objective of the QUAD is realizing a 'Free and Open Indo-Pacific' (FOIP).")
verified[42] = ('B', "The plea of legal insanity (unsoundness of mind) operates as a fact in issue regarding general exceptions in criminal trials.")
verified[43] = ('B', "Deepa Bhasthi translated Banu Mushtaq's International Booker Prize-winning short story collection 'Heart Lamp' from Kannada.")
verified[44] = ('A', "As per Census 2011, Lakshadweep recorded the lowest overall Work Participation Rate in India at 29.09%.")
verified[45] = ('A', "The NISAR observatory features an L-band SAR provided by NASA and an S-band SAR provided by ISRO.")
verified[46] = ('B', "Post-1991 banking reforms were instituted under the statutory supervision and regulatory oversight of the Reserve Bank of India.")
verified[47] = ('D', "The Air Quality Index (AQI) simplifies complex multi-pollutant data into an easily understandable single metric communicating air quality.")
verified[48] = ('B', "Sher Shah Suri reconstructed and extended the ancient Mauryan imperial highway (Uttarapatha) as Sadak-e-Azam (Grand Trunk Road).")
verified[49] = ('B', "Poligars rose in rebellion primarily because British administrative encroachment threatened their hereditary revenue and sovereign status.")
verified[50] = ('C', "Prolonged absence of sunlight halts photosynthesis, preventing food production and chlorophyll synthesis, leading to etiolation.")

# ==========================================
# Quantitative Aptitude (Q51 - Q75)
# ==========================================
verified[51] = ('B', "Equating volumes, (2/3)π(6.3)³ = π(9)²h gives h = 500.094 / 243 = 2.058 cm.")
verified[52] = ('A', "In a right-angled triangle with sides 7, 24, 25 cm, the circumradius equals half the hypotenuse: 25 / 2 = 12.5 cm.")
verified[53] = ('C', "Interior minus exterior angle is 132° and their sum is 180°, so exterior angle = 24°, giving n = 360°/24° = 15 sides.")
verified[54] = ('A', "Using class midpoints, Batch A has an estimated mean of 54.57 compared to 46.29 for Batch B.")
verified[55] = ('C', "(1 + sinθ)(1 - sinθ) = 1 - sin²θ = cos²θ; for tanθ = 3/4, cosθ = 4/5, so cos²θ = (4/5)² = 16/25.")
verified[56] = ('A', "Sum of top two fruits (Bananas 150 + Apples 120 = 270) to bottom two (Oranges 90 + Grapes 60 = 150) gives 270:150 = 9:5.")
verified[57] = ('A', "Sum of female literacy rates (96 + 60 + 55 + 88 + 82) = 381; average = 381 / 5 = 76.2%.")
verified[58] = ('A', "Original blue is 300; adding 20% of other (20% of 100 = 20) yields 320 out of 1000 respondents, or 32%.")
verified[59] = ('B', "Using algebraic identity (a³ - b³)/(a² + ab + b²) = a - b with a = 0.5 and b = 0.3 yields 0.5 - 0.3 = 0.2.")
verified[60] = ('B', "Using algebraic identity (a³ - b³)/(a² + ab + b²) = a - b with a = 0.013 and b = 0.011 yields 0.013 - 0.011 = 0.002.")
verified[61] = ('C', "From 2x = 0.5y, y = 4x; simplifying (y² - x²)/(y + x)² = (y - x)/(y + x) = (4 - 1)/(4 + 1) = 3/5.")
verified[62] = ('A', "For 5x2y1 to be divisible by 3 with x = y = d, 8 + 2d must be a multiple of 3; d = 2 yields sum 12, so x + y = 4.")
verified[63] = ('D', "The angle formed by internal angle bisectors at incenter R is 90° + ∠W/2 = 90° + 50°/2 = 115°.")
verified[64] = ('B', "CP1 = 5000/1.25 = 4000; total CP = 10000 requires CP2 = 6000, giving a loss of (1000/6000) × 100% = 16.67%.")
verified[65] = ('C', "By the inscribed angle theorem, the angle subtended by a chord at the centre is twice that at the circumference: 2 × 55° = 110°.")
verified[66] = ('A', "Distance between ships = 80(√3 - 1) = 80(1.732 - 1) = 58.56 m ≈ 59 m.")
verified[67] = ('C', "Area is proportional to diagonal squared; an increase of 20% leads to (1.20)² - 1 = 0.44 = 44% increase in area.")
verified[68] = ('C', "The central angle is 2 × 45° = 90°; in an isosceles right triangle with hypotenuse 8 cm, the distance from centre is 8/2 = 4 cm.")
verified[69] = ('B', "The triangles share two equal angles (50° and 60°) and the included side (AB = DE), satisfying the ASA criterion.")
verified[70] = ('D', "Distance from centre to chord is 8/2 = 4 cm; half-chord = √(8² - 4²) = 4√3 cm, giving total common chord length = 8√3 cm.")
verified[71] = ('C', "A 60% profit on milk sold at cost price implies milk to water ratio 100:60 = 5:3, so water is 3/(5+3) = 37.5% of the mixture.")
verified[72] = ('D', "Total cars = 560; 20% threshold is 112 cars, which is exceeded only in the 8-9 interval (128 cars).")
verified[73] = ('B', "PB = √(6² + 8²) = 10 cm; by triangle similarity QB = 10 × (3/6) = 5 cm, so PQ = 10 + 5 = 15 cm.")
verified[74] = ('A', "Total study time is 2400 min; math takes 840 min and saving 20% frees 168 min; adding half (84 min) to reasoning gives 240 + 84 = 324 min.")
verified[75] = ('A', "Initial cohort N satisfies N × 0.70 × 0.75 × 0.80 = 42 => 0.42 N = 42, giving N = 100 startups.")

# ==========================================
# English Comprehension (Q76 - Q100)
# ==========================================
verified[76] = ('A', "An imperative prohibition 'Don't go with him' converts into reported speech with 'forbade me to go'.")
verified[77] = ('A', "Direct yes/no question in present tense shifts to past tense with conjunction 'if': 'asked me if I liked mangoes'.")
verified[78] = ('A', "The noun 'fortitude' requires the adjective 'mechanical' to convey automatic, unyielding endurance.")
verified[79] = ('C', "The correct sequence QRSP links summit outcomes smoothly: discussions on security (Q), climate policies (R), bilateral trade (S), and cooperation (P).")
verified[80] = ('B', "The idiom 'crossed swords' means to engage in a heated dispute, argument, or confrontation.")
verified[81] = ('A', "The idiom 'to take to one's heels' means to flee or run away quickly.")
verified[82] = ('C', "The superlative degree of boring is 'most boring', correctly replacing the non-standard form 'borest'.")
verified[83] = ('B', "The adverb 'strongly' is an error modifying the noun 'feeling'; the adjective 'strong' should be used.")
verified[84] = ('D', "The adjective 'moot' is correctly used here to mean having no practical significance because the policy is already enacted.")
verified[85] = ('B', "The correctly spelled word is 'speculative'.")
verified[86] = ('B', "'Reserved' is the exact antonym of 'gregarious' (sociable, outgoing).")
verified[87] = ('C', "The correct spelling denoting long-winded polysyllabic words is 'Sesquipedalian'.")
verified[88] = ('D', "'Prophane' is misspelled; the correct spelling is 'profane', whereas 'perspicuity' is spelled correctly.")
verified[89] = ('C', "The one-word substitution for something that cannot be explained or understood is 'Inexplicable'.")
verified[90] = ('B', "An 'enigma' is a person or thing that is mysterious or difficult to understand; a riddle is an enigmatic question or puzzle.")
verified[91] = ('D', "Part (4) is grammatically flawed; it requires an article or plural form ('the reader's trust' or 'readers' trust').")
verified[92] = ('C', "Sentence C uses 'fetish' in its psychological fixation sense, acting as a homonym to the ritual/tribal artifact meaning.")
verified[93] = ('B', "The habitual phrasal structure 'be used to' takes a gerund: 'is used to working hard'.")
verified[94] = ('C', "In reported speech, modal 'must' expressing obligation shifts to 'had to' and 'this' shifts to 'that'.")
verified[95] = ('B', "Paragraph flow begins with the melting observation (2), defines the latent heat phenomenon (1), highlights its thermodynamic importance (4), and explains the bond-breaking mechanism (3).")
verified[96] = ('A', "'Assimilated' is the standard cognitive term for integrating new knowledge into existing mental frameworks in long-term memory.")
verified[97] = ('C', "'Accommodate' accurately conveys adapting instructional design to take learners' mental limitations into consideration.")
verified[98] = ('B', "'Lest' is the appropriate conjunction indicating prevention of an undesirable outcome ('lest students confuse...').")
verified[99] = ('B', "The conjunction 'Although' correctly establishes the contrast between expanding technological capabilities and persistent access disparities.")
verified[100] = ('C', "'Subside' accurately denotes the gradual diminishing or fading of initial enthusiasm/appeal.")

# Verify all 100 questions are covered
assert len(verified) == 100, f"Expected 100 questions, got {len(verified)}"

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
    new_ans, reason = verified[qn]
    
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
    "paper_id": 50,
    "title": "SSC CGL 2026 Tier-I (Held On 12 October 2026 Shift 3)",
    "total_questions": len(questions),
    "changes_count": len(changes),
    "changes": changes
}

patch_dir = os.path.join(r"c:\ssczone\scripts", "verified_patches")
os.makedirs(patch_dir, exist_ok=True)
patch_path = os.path.join(patch_dir, "patch_paper_50.json")

with open(patch_path, 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, indent=2, ensure_ascii=False)

print(f"Patch successfully generated at {patch_path}")
print(f"Total questions: {len(questions)}")
print(f"Total changes: {len(changes)}")
print("\nSection-wise breakdown of changes:")
for sec, cnt in section_counts.items():
    print(f"  - {sec}: {cnt}")

print("\nList of all changed questions:")
for ch in changes:
    print(f"  Q{ch['question_number']:02d} (ID: {ch['id']}): {ch['old_answer']} -> {ch['new_answer']} | {ch['reason']}")
