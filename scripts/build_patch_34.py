import json

with open(r'c:\ssczone\scripts\paper_inputs\paper_34.json', 'r', encoding='utf-8') as f:
    questions = {q['question_number']: q for q in json.load(f)}

changes_raw = [
    {
        "question_number": 11,
        "new_answer": "D",
        "reason": "Option D is the exact character-for-character match preserving 'Ω-17/B', the accented 'd’Élite', and PIN '400706'."
    },
    {
        "question_number": 25,
        "new_answer": "C",
        "reason": "Ichthyology is the branch of zoology dedicated to the study of fish (Option C), whereas entomology is the study of insects."
    },
    {
        "question_number": 32,
        "new_answer": "A",
        "reason": "Under standard International Kabaddi Federation and PKL rules, a team is permitted a maximum of 5 substitutions per match."
    },
    {
        "question_number": 35,
        "new_answer": "A",
        "reason": "Usha Mehta established and operated the clandestine Secret Congress Radio during the Quit India Movement in 1942."
    },
    {
        "question_number": 38,
        "new_answer": "C",
        "reason": "In Gupta administration, Pustapalas were official record-keepers tasked with maintaining registers of land sales, dimensions, and municipal documents."
    },
    {
        "question_number": 39,
        "new_answer": "A",
        "reason": "At the 1976 Montreal Olympics, the Indian men's hockey team finished 7th, missing an Olympic podium finish for the first time since 1928."
    },
    {
        "question_number": 44,
        "new_answer": "C",
        "reason": "Pitt's India Act of 1784 created a 6-member Board of Control consisting of the Chancellor of the Exchequer, a Secretary of State, and four Privy Councillors."
    },
    {
        "question_number": 47,
        "new_answer": "C",
        "reason": "Under the Seventh Schedule of the Indian Constitution, 'Public Order' is enumerated as Entry 1 of List II (State List)."
    },
    {
        "question_number": 53,
        "new_answer": "B",
        "reason": "With perimeter a(2 + √2) = 2 + √2 cm, leg a = 1 cm, yielding area = (1/2) × 1² = 0.5 cm² (Option B)."
    },
    {
        "question_number": 59,
        "new_answer": "D",
        "reason": "A 6-digit number divisible by 7, 11, and 13 (1001) is in abcabc form; matching 5z3x4y gives x=5, z=4, y=3, so x + y - z = 5 + 3 - 4 = 4 (Option D)."
    },
    {
        "question_number": 60,
        "new_answer": "A",
        "reason": "Centroid G divides median ZM in a 2:1 ratio from vertex Z; with GZ = 6 cm, median ZM = 6 × (3/2) = 9 cm (Option A)."
    },
    {
        "question_number": 61,
        "new_answer": "C",
        "reason": "There are exactly 5 prime numbers between 120 and 150: 127, 131, 137, 139, and 149 (Option C)."
    },
    {
        "question_number": 62,
        "new_answer": "B",
        "reason": "Meeting time T = √(80 × 45) = 60 minutes, so they met at 9:00 a.m. + 60 minutes = 10:00 a.m. (Option B)."
    },
    {
        "question_number": 63,
        "new_answer": "C",
        "reason": "C completes 1/10 of the work in 3 days (efficiency 1/30 per day); thus C takes 0.40 / (1/30) = 12 days to complete 40% of the work (Option C)."
    },
    {
        "question_number": 64,
        "new_answer": "C",
        "reason": "The equation simplifies to 2/cos θ = 4, giving cos θ = 1/2 and θ = 60° (Option C)."
    },
    {
        "question_number": 72,
        "new_answer": "B",
        "reason": "Integer solution to x² + y² = 464 - 256 = 208 is (8, 12); working together with 36 hours/day takes 464 / 36 ≈ 12.89 ≈ 13 days (Option B)."
    },
    {
        "question_number": 74,
        "new_answer": "A",
        "reason": "The recurring decimal 0.416̄ equals (416 - 41)/900 = 375/900 = 5/12 (Option A)."
    },
    {
        "question_number": 81,
        "new_answer": "A",
        "reason": "'Delineated' correctly collocates with 'parameters' (defining clear boundaries), whereas 'deliberated' typically requires the preposition 'on/upon'."
    },
    {
        "question_number": 83,
        "new_answer": "A",
        "reason": "'Cast off' means to discard or rid oneself of distractions; 'cast down' means to make dejected or sad."
    },
    {
        "question_number": 84,
        "new_answer": "A",
        "reason": "Sequence QPRS correctly places the participial modifier 'concerning...' directly after 'ethical dilemmas' and connects the main clause smoothly."
    },
    {
        "question_number": 87,
        "new_answer": "A",
        "reason": "'To freely exclude oneself from external governance' is contrary to the meaning of 'subject'; the verb 'subject' means to cause someone to undergo an ordeal (Option D)."
    }
]

patch_data = {
    "paper_id": 34,
    "title": "SSC CGL 2026 Tier-I (Held On 6 October 2026 Shift 2)",
    "total_questions": 100,
    "changes_count": len(changes_raw),
    "changes": []
}

for item in changes_raw:
    qn = item["question_number"]
    q_obj = questions[qn]
    patch_data["changes"].append({
        "question_number": qn,
        "id": q_obj["id"],
        "old_answer": q_obj["correct_answer"],
        "new_answer": item["new_answer"],
        "reason": item["reason"]
    })

out_path = r'c:\ssczone\scripts\verified_patches\patch_paper_34.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, indent=2, ensure_ascii=False)

print(f"Generated patch file at {out_path} with {len(patch_data['changes'])} changes.")
