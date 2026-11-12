import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open(r"c:\ssczone\scripts\paper_inputs\paper_30.json", encoding="utf-8"))

# Define verified changes
# changes is a dict mapping question_number to (new_answer, reason)
changes_map = {
    # Reasoning
    1: ("D", "3rd letter is C (index 3) and 7th letter is L (index 12); difference is 12 - 3 = 9."),
    10: ("D", "Option D is the exact character-by-character match for the given address."),
    25: ("B", "Analogy of increasing thermal intensity: simmer leads to boil just as chill leads to freeze."),
    
    # General Awareness
    30: ("A", "The 2017 FIFA U-17 World Cup final was hosted at Salt Lake Stadium (Vivekananda Yuba Bharati Krirangan) in Kolkata."),
    31: ("A", "En passant is a special pawn capture rule in chess."),
    33: ("C", "Aparajitavarman (Aparajita) was the last ruler of the Pallava dynasty, defeated by Chola king Aditya I."),
    35: ("C", "A gharana in Hindustani classical music represents a school or lineage of musical tradition and style."),
    38: ("D", "Bara Pani Lake (also known as Umiam Lake) is located in Meghalaya, near Shillong."),
    40: ("B", "Statement 1 is incorrect because IOD is defined across the Indian Ocean (not Pacific); statement 2 is correct, so Only 2 is right."),
    
    # Quantitative Aptitude
    64: ("D", "Since A + B = C, tan C = (tan A + tan B)/(1 - tan A tan B) => tan A tan B tan C = tan C - tan A - tan B."),
    66: ("C", "(15 + 5√5)/√5 = 3√5 + 5 = 3(2.236) + 5 = 6.708 + 5 = 11.708."),
    67: ("B", "In isosceles triangles OPS and OQS, ∠OSP = (180° - 85°)/2 = 47.5° and ∠OSQ = (180° - 115°)/2 = 32.5°, so ∠PSQ = 47.5° + 32.5° = 80°."),
    68: ("C", "By Thales theorem, AD × AC = AB × AE implies DE || BC, so ∠ADE = ∠ABC = 65°; thus ∠ACB = 65° - 15° = 50°, giving ∠A = 180° - (65° + 50°) = 65°."),
    69: ("C", "True volume V = 235.2 / (1.12 × 1.05) = 235.2 / 1.176 = 200 litres."),
    70: ("B", "With a = x and d = 2x, S₄ = 2(2x + 6x) = 16x and S₉ = 4.5(2x + 16x) = 81x, giving the ratio 16 : 81."),
    71: ("D", "Work rates are Sonia 20, Tuktuk 12, Pamela 15 (total 300); after 5 days 105 units remain, taking Pamela 7 more days alone, so Pamela worked 3 + 2 + 7 = 12 total days."),
    72: ("C", "tan(90° - 2θ) = cot 2θ and tan(90° - θ) = cot θ, so (cot 2θ · tan 2θ)(cot θ · tan θ) = 1 · 1 = 1."),
    74: ("D", "After replacing 32 L with water, milk and water are 80 L each; removing 24 L (12 L each) and adding 24 L milk yields 92 L milk and 68 L water, giving ratio 92:68 = 23:17."),
    75: ("B", "Length of transverse common tangent = √(d² - (r₁ + r₂)²); 40 = √(41² - 9²), so r₁ + r₂ = 9 => r₂ = 9 - 6 = 3 cm."),
    
    # English Comprehension
    85: ("C", "'Institutional protocol' accurately describes the procedural rules and mechanisms that govern the archive's functioning."),
    86: ("B", "Context 'denied syntactic viability within the lexicon of national legitimacy' precisely defines 'inarticulable'."),
    87: ("C", "Items included are endowed with authoritative status, matching 'canonized' and 'endowed with rhetorical inertia that naturalizes their interpretive authority'."),
    88: ("B", "Singular subject 'it' requires the singular verb 'regulates', fitting 'dictating not only what can be known, but what may be mourned'."),
    89: ("B", "'Ontological sabotage' entails disrupting or undermining, so 'destabilize' is the precise contextual fit."),
    97: ("C", "Modal 'must have' expressing logical deduction remains unchanged in indirect speech; 'must had' is ungrammatical."),
    99: ("C", "The direct speech corresponding to the inverted subjunctive conditional 'were it not for her, they would have lost everything' is '\"Were it not for her, we would have lost everything,\" he said.'")
}

changes_list = []
for q in data:
    qnum = q["question_number"]
    old_ans = q["correct_answer"]
    if qnum in changes_map:
        new_ans, reason = changes_map[qnum]
        changes_list.append({
            "question_number": qnum,
            "id": q["id"],
            "old_answer": old_ans,
            "new_answer": new_ans,
            "reason": reason
        })

patch = {
    "paper_id": 30,
    "title": "SSC CGL 2026 Tier-I (Held On 5 October 2026 Shift 1)",
    "total_questions": 100,
    "changes_count": len(changes_list),
    "changes": changes_list
}

with open(r"c:\ssczone\scripts\verified_patches\patch_paper_30.json", "w", encoding="utf-8") as f:
    json.dump(patch, f, indent=2, ensure_ascii=False)

print(f"Generated patch with {len(changes_list)} changes.")
for c in changes_list:
    print(f"Q{c['question_number']:2d} (ID: {c['id']}): {c['old_answer']} -> {c['new_answer']} | {c['reason']}")
