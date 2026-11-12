import json

with open('c:/ssczone/scripts/paper_inputs/paper_52.json', 'r', encoding='utf-8') as f:
    questions = {q['question_number']: q for q in json.load(f)}

changes_data = [
    # Reasoning
    (1, 'C', "In the folded cube, opposite pairs are (23, 73), (31, 89), and (59, 97); thus 31 and 59 are not opposite."),
    (11, 'D', "Advising a backup before software update implies both that the update may affect files (I) and that preserving files is important (II)."),
    (12, 'C', "Lateral reflection across vertical mirror MN orders characters in reverse (mirrored 5, e, 9, 2, w, t), which matches Option C."),
    (17, 'B', "In figures A, C, and D, the dot is located near the rounded end, whereas in figure B, the dot is near the flat end with the flame."),
    (20, 'B', "The repeating 4-letter unit is 'mnom', requiring missing letters 'n, o, m, o', corresponding to Option B."),
    (22, 'B', "The 4-symbol diagonal pattern cycles with period 4, so figure 6 repeats figure 2 (×, ↑, Δ, =), matching Option B."),
    (23, 'C', "Mrs. Sharma satisfies age (>60), lack of insurance, and income (<$15,000) requirements, so she should be selected for the grant."),
    (24, 'C', "In ACEG, BDFH, and DFHJ the consecutive letter intervals are +2; in CEGJ the interval between G and J is +3."),
    (25, 'D', "Unfolding across both vertical and horizontal folds reflects the punch into all four quadrants, matching Figure D (Option D)."),
    
    # General Awareness
    (32, 'C', "Barbara Kingsolver authored 'Demon Copperhead' and won the 2023 Women's Prize for Fiction (Option C)."),
    
    # Quantitative Aptitude
    (51, 'B', "Summing participant frequencies from the polygon: 15 + 28 + 20 + 12 + 7 + 3 = 85 (Option B)."),
    (52, 'D', "Average speed = 4 / (1/400 + 1/200 + 1/100 + 1/50) = 1600 / 15 ≈ 106.67 km/h (Option D)."),
    (53, 'C', "Capitals 5:4:5 for periods 12:9:9 months yield profit ratio (5×12):(4×9):(5×9) = 60:36:45 = 20:12:15 (Option C)."),
    (54, 'B', "With investments 4x and 7x, [5(4x)+7(4x-1000)]/[5(7x)+7(7x-2000)] = 29/49 gives x = 750, so A's initial investment is ₹3,000 (Option B)."),
    (59, 'C', "Time from 60° position to lighthouse = 6 / (√3 - 1) = 3(√3 + 1) ≈ 8.2 minutes ≈ 8 minutes (Option C)."),
    (60, 'B', "Trapezium height = 12 cm, base projection = (22-10)/2 = 6 cm, non-parallel side = √(12² + 6²) = √180 = 6√5 cm (Option B)."),
    (62, 'B', "Dividing 5 sin θ + 12 cos θ = 13 by 13 gives sin θ = 5/13 (Option B); 12/13 is cos θ."),
    (64, 'C', "Students with height <170 cm = 38, >160 cm = 82; percentage = (38/82) × 100% ≈ 46.3% (Option C)."),
    (70, 'D', "Coin count ratio is 3:4:5 for 480 coins (120, 160, 200), giving monetary value 120(0.50) + 160(0.25) + 200(0.10) = Rs. 120 (Option D)."),
    
    # English Comprehension
    (97, 'D', "The contrast between long-debated limitations and recent dynamic findings requires the concessive conjunction 'While' (Option D).")
]

patch_changes = []
for qnum, new_ans, reason in changes_data:
    q = questions[qnum]
    old_ans = q.get('correct_answer')
    patch_changes.append({
        "question_number": qnum,
        "id": q["id"],
        "old_answer": old_ans,
        "new_answer": new_ans,
        "reason": reason
    })

patch_payload = {
    "paper_id": 52,
    "title": "SSC CGL 2026 Tier-I (Held On 13 October 2026 Shift 2)",
    "total_questions": 100,
    "changes_count": len(patch_changes),
    "changes": patch_changes
}

out_path = 'c:/ssczone/scripts/verified_patches/patch_paper_52.json'
with open(out_path, 'w', encoding='utf-8') as out:
    json.dump(patch_payload, out, indent=2, ensure_ascii=False)

print(f"Successfully generated patch file at {out_path}")
print(f"Total changes recorded: {len(patch_changes)}")
