import json
import os

paper_path = 'c:/ssczone/scripts/paper_inputs/paper_44.json'
with open(paper_path, encoding='utf-8') as f:
    questions = json.load(f)

q_by_num = {q['question_number']: q for q in questions}

changes_def = [
    # General Intelligence & Reasoning (Q1-25)
    (2, 'C', 'Opposite faces in the net are H-E, M-V, and W-L, matching net C.'),
    (4, 'D', 'Bali, Sumatra, and Java are Indonesian islands, whereas Madagascar is an island nation off East Africa.'),
    (5, 'C', 'Neither conclusion I nor II definitely follows from the statement as they are merely hypotheses.'),
    (12, 'D', 'ADF : WUZ follows the reverse alphabetical cipher permutation (middle, last, first), mapping PQR to JIK.'),
    (16, 'B', 'Standard counting geometric figure has 44 total triangles.'),
    (17, 'B', 'Professional medical nursing protocol mandates documenting discrepancy, informing the doctor, and monitoring the patient.'),
    (18, 'B', 'Non-verbal analogy: cyclic position shift and orientation change yields Answer Figure 1, which corresponds to Option B.'),
    (19, 'D', 'The central intersection with four arms and crossed diagonal lines is embedded in Answer Figure 3 (Option D).'),
    (20, 'B', 'Figure (d) contains two disconnected parallel diagonals instead of a single cross-quadrant triangle (Option B).'),
    (22, 'B', 'Positions and multiplicities swap: single square top-left and double arc bottom-right gives Answer Figure 2 (Option B).'),
    (24, 'B', 'Figure X is embedded in the center and diagonal lines of Answer Figure 2 (Option B).'),
    (25, 'B', 'First letters +2 (J->L), second letters +2 (K->M), third letters -1 (V->U) gives LMU (Option B).'),
    
    # General Awareness (Q26-50)
    (36, 'A', 'Putul Samaroh is an annual puppet festival organized by the Department of Culture, Government of Madhya Pradesh.'),
    (37, 'C', 'Suwa (Parrot) dance in Chhattisgarh is traditionally performed by women around Diwali to invoke and please the Goddess of Wealth (Lakshmi).'),
    (39, 'B', 'SEBI launched Saa₹thi 2.0 to empower investors with objective knowledge about the securities market.'),
    (40, 'B', 'Bhattkhadaki is a Gujarati poetry collection by Yogesh Vaidya that won the Sahitya Akademi Award 2025.'),
    (43, 'B', 'Former Chief Justice of India Jagdish Singh Khehar was awarded the Padma Vibhushan in 2025 in Public Affairs.'),
    (44, 'B', 'According to Census of India 2011, primary sector workforce distribution is Male: 16,54,47,075 and Female: 9,75,75,398.'),
    (45, 'C', 'Both statements are correct: Indo-Islamic architecture extensively used thick rubble masonry walls, and Mandu exemplifies the Provincial style.'),
    (46, 'C', 'ISRO provided its heritage I-3K spacecraft bus as the satellite platform for the NISAR mission.'),
    (47, 'D', 'The Narasimham Committee was appointed in August 1991 to recommend reforms in India\'s banking and financial system.'),
    
    # Quantitative Aptitude (Q51-75)
    (55, 'C', 'In the frequency polygon, Section B has its highest frequency peak (20 students) in the 61-80 score class interval.'),
    (57, 'A', 'Bus has the highest diesel-to-petrol consumption ratio (90 L / 10 L = 9:1).'),
    (58, 'B', 'Grocery budget is 20% of $4,000 = $800 (Option B).'),
    (59, 'C', 'The highest bar in the salary histogram corresponds to the 40-50 thousand dollar range (550 employees).'),
    (63, 'B', 'Let tens digit be 2x, units x. 21x - 12x = 9x = 18 => x = 2, so the original number is 42.'),
    (64, 'B', 'By angle bisector theorem, ZS/SW = ZR/RW = 10/14 = 5/7; SW = (7/12) * 12 = 7 cm.'),
    (66, 'B', 'Points on the major and minor arcs form a cyclic quadrilateral with the chord endpoints, so subtended angles sum to 180°.'),
    (67, 'B', 'Trapezium area: 0.5 * (2x + 3x) * 19 = 475 => x = 10; longer parallel side = 3x = 30 cm.'),
    (69, 'C', 'In △DEF, ∠D = 180° - (85° + 40°) = 55° = ∠A; AB=DE, AC=DF, so triangles are congruent by SAS property.'),
    (70, 'D', 'For two congruent circles passing through each other\'s centers, common chord length is R√3 = 12√3 cm.'),
    (71, 'D', 'Total CP = 25*240 + 15*300 = ₹10,500 for 40 kg (₹262.5/kg); SP at 25% profit = 262.5 * 1.25 = ₹328.125 per kg.'),
    (73, 'B', 'New population of D = 18 * 1.15 = 20.7; other regions = 82 * 1.05 = 86.1; percentage share = 20.7 / 106.8 ≈ 19.4%.'),
    (75, 'D', 'P * (7/6) * (7/8) * (8/7) = P * (7/6) = 2,80,000 => P = 2,40,000.'),
    
    # English Comprehension (Q76-100)
    (99, 'B', 'In indirect speech for simple past (met), the verb shifts to past perfect (had met): She said that she had met him the day before.')
]

changes_list = []
for qn, new_ans, reason in changes_def:
    q = q_by_num[qn]
    old_ans = q['correct_answer']
    assert old_ans != new_ans, f"Old and new answers are the same for Q{qn}!"
    changes_list.append({
        "question_number": qn,
        "id": q['id'],
        "old_answer": old_ans,
        "new_answer": new_ans,
        "reason": reason
    })

patch_data = {
    "paper_id": 44,
    "title": "SSC CGL 2026 Tier-I (Held On 9 October 2026 Shift 3)",
    "total_questions": len(questions),
    "changes_count": len(changes_list),
    "changes": changes_list
}

out_dir = 'c:/ssczone/scripts/verified_patches'
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, 'patch_paper_44.json')

with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, indent=2, ensure_ascii=False)

print(f"Successfully generated patch file: {out_file}")
print(f"Total changes count: {len(changes_list)}")
