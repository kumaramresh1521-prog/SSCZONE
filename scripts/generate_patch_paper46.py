import json
import os

with open(r'c:\ssczone\scripts\paper_inputs\paper_46.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Map question_number -> (new_answer, reason) for changed questions
changes_map = {
    14: ('C', "Columns III, IV, and V follow a constant ratio 1 : 3 : 7 across all rows (Col IV = 3 × Col III, Col V = 7 × Col III)."),
    18: ('C', "Figure C has a counter-clockwise cyclic arrangement of black, white, and grey circles, whereas figures A, B, and D have a clockwise arrangement."),
    34: ('B', "G. Sankara Kurup was the first recipient of the Jnanpith Award in 1965 for his Malayalam poetry collection Odakkuzhal."),
    35: ('A', "Lothal had a tidal dockyard and Mehrgarh is the earliest agricultural site; horse remains are from Surkotada, not Ropar, so only 1 and 3 are correct."),
    36: ('C', "The Kumaun Himalayas geographically lie between the Sutlej and Kali rivers."),
    37: ('A', "Folate (Vitamin B9) is essential for thymidylate synthesis in DNA replication, and its deficiency results in megaloblastic anaemia."),
    38: ('D', "According to the India State of Forest Report (ISFR), Gujarat recorded the highest long-term increase of 253.06 km² in mangrove cover."),
    46: ('B', "In February 2026, a cohort of 9 cheetahs (6 females and 3 males) was translocated from Botswana to Kuno National Park."),
    48: ('D', "Foreign Direct Investment (FDI) creates a lasting interest and significant managerial influence in an enterprise, unlike FII portfolio investment."),
    49: ('C', "The Iqta system was a characteristic administrative institution of the Delhi Sultanate, whereas the Jagirdari system developed under the Mughals."),
    51: ('B', "Sum of frequencies in the plant height frequency polygon is 8 + 15 + 25 + 17 + 10 + 5 = 80 plants."),
    57: ('B', "Initial CP = 100, SP = 140; new CP = 130, new SP = 168; profit percentage = (38 / 130) × 100 ≈ 29.23%."),
    59: ('B', "Building height = 40 m with 45° depression gives distance 40 m; top at 30° gives 40 - h = 40/√3, so h = 40 - 40/√3 m."),
    60: ('C', "Inscribed circle diameter = 12 cm; area of square inscribed inside this circle = d² / 2 = 144 / 2 = 72 cm²."),
    64: ('C', "Customers spending > $150 = 3 + 15 = 18; spending < $50 = 30; percentage = (18 / 30) × 100 = 60%."),
    65: ('B', "(1 - x/100)² = 612.50 / 800 = 49/64 yields x = 12.5%; a single 25% discount gives SP = 800 × 0.75 = ₹600."),
    67: ('B', "Brand A share is 30% and Brand D+E combined share is 25%; difference = 5% of ₹50,00,000 = ₹2,50,000."),
    74: ('B', "Total sales for Brand B across 4 months = 90 + 110 + 140 + 160 = 500 units; average = 500 / 4 = 125 units."),
    75: ('C', "Winner's lead of 8% corresponds to 5,184 valid votes, giving 64,800 valid votes; total registered voters = 64,800 / (0.90 × 0.96) = 75,000."),
    88: ('C', "Disbandment or dissolution of a contract is not a definition of constitution, whereas physical/mental health makeup (B) is a recognized meaning.")
}

changes = []
for q in questions:
    qn = q['question_number']
    qid = q['id']
    old_ans = q['correct_answer']
    if qn in changes_map:
        new_ans, reason = changes_map[qn]
        changes.append({
            "question_number": qn,
            "id": qid,
            "old_answer": old_ans,
            "new_answer": new_ans,
            "reason": reason
        })

patch_data = {
    "paper_id": 46,
    "title": "SSC CGL 2026 Tier-I (Held On 10 October 2026 Shift 2)",
    "total_questions": len(questions),
    "changes_count": len(changes),
    "changes": changes
}

os.makedirs(r'c:\ssczone\scripts\verified_patches', exist_ok=True)
patch_path = r'c:\ssczone\scripts\verified_patches\patch_paper_46.json'
with open(patch_path, 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, indent=2, ensure_ascii=False)

print(f"Successfully created {patch_path} with {len(changes)} changes.")
