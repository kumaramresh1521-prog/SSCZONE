import json

with open('c:/ssczone/scripts/paper_inputs/paper_40.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Let's map questions by number
q_map = {q['question_number']: q for q in questions}

# Proposed changes list
# Let's verify each one
changes = [
    {
        "question_number": 9,
        "id": q_map[9]["id"],
        "old_answer": q_map[9]["correct_answer"],
        "new_answer": "B",
        "reason": "First letter 'L' remains fixed while the remaining letters are reversed/rearranged to form 'LGINIV' (Option A was a truncated 5-letter typo)."
    },
    {
        "question_number": 13,
        "id": q_map[13]["id"],
        "old_answer": q_map[13]["correct_answer"],
        "new_answer": "D",
        "reason": "Pattern is n^3 - (n-1) for odd n: 5^3-4=121, 7^3-6=337, 9^3-8=721, 11^3-10=1321, 13^3-12=2185."
    },
    {
        "question_number": 14,
        "id": q_map[14]["id"],
        "old_answer": q_map[14]["correct_answer"],
        "new_answer": "C",
        "reason": "There are 3 instances of 'TRP' in the sequence TRPTRTRPRRTRPPT (at positions 1-3, 6-8, and 11-13)."
    },
    {
        "question_number": 24,
        "id": q_map[24]["id"],
        "old_answer": q_map[24]["correct_answer"],
        "new_answer": "A",
        "reason": "Force is measured in Newtons (SI unit), similarly Work is measured in Joules (SI unit)."
    },
    {
        "question_number": 28,
        "id": q_map[28]["id"],
        "old_answer": q_map[28]["correct_answer"],
        "new_answer": "B",
        "reason": "Dr. Vikram Sarabhai is universally recognized as the Father of the Indian Space Program."
    },
    {
        "question_number": 29,
        "id": q_map[29]["id"],
        "old_answer": q_map[29]["correct_answer"],
        "new_answer": "A",
        "reason": "NISAR stands for NASA-ISRO Synthetic Aperture Radar, a joint mission between NASA and ISRO."
    },
    {
        "question_number": 31,
        "id": q_map[31]["id"],
        "old_answer": q_map[31]["correct_answer"],
        "new_answer": "D",
        "reason": "Vikram Sampath won the inaugural Sahitya Akademi Yuva Puraskar in 2011 in English for his biography of Gauhar Jaan."
    },
    {
        "question_number": 34,
        "id": q_map[34]["id"],
        "old_answer": q_map[34]["correct_answer"],
        "new_answer": "A",
        "reason": "In standard chess notation, kingside castling is designated by '0-0'."
    },
    {
        "question_number": 36,
        "id": q_map[36]["id"],
        "old_answer": q_map[36]["correct_answer"],
        "new_answer": "B",
        "reason": "K. Sanjay Murthy was appointed as the Comptroller and Auditor General (CAG) of India in November 2024."
    },
    {
        "question_number": 37,
        "id": q_map[37]["id"],
        "old_answer": q_map[37]["correct_answer"],
        "new_answer": "C",
        "reason": "Jawaharlal Nehru conferred the title 'Daughter of the hills' on Rani Gaidinliu in 1937."
    },
    {
        "question_number": 55,
        "id": q_map[55]["id"],
        "old_answer": q_map[55]["correct_answer"],
        "new_answer": "B",
        "reason": "Using algebraic identity (a^3 - b^3)/(a^2 + ab + b^2) = a - b where a = √6.25 = 2.5 and b = √1.44 = 1.2 gives 2.5 - 1.2 = 1.3."
    },
    {
        "question_number": 56,
        "id": q_map[56]["id"],
        "old_answer": q_map[56]["correct_answer"],
        "new_answer": "C",
        "reason": "Total work is 48 units; P works 3 days, Q works (D-2) days, R works D days: 12 + 3(D-2) + 2D = 48 => 5D = 42 => D = 8 2/5 days."
    },
    {
        "question_number": 57,
        "id": q_map[57]["id"],
        "old_answer": q_map[57]["correct_answer"],
        "new_answer": "B",
        "reason": "Equal volume gives A + R/3 = R + A/5 => (4/5)A = (2/3)R => A:R = 5:6."
    },
    {
        "question_number": 62,
        "id": q_map[62]["id"],
        "old_answer": q_map[62]["correct_answer"],
        "new_answer": "B",
        "reason": "Let CP = 100x; SP1 = 105x, CP2 = 95x, SP2 = 1.10(95x) = 104.5x; 105x - 104.5x = 1 => 0.5x = 1 => CP = ₹200."
    },
    {
        "question_number": 64,
        "id": q_map[64]["id"],
        "old_answer": q_map[64]["correct_answer"],
        "new_answer": "B",
        "reason": "In △XYZ, ∠Z = 60°; since ∠Y (55°) < ∠Z (60°) < ∠X (65°), the opposite sides satisfy XZ < XY < YZ, hence XZ < XY."
    },
    {
        "question_number": 78,
        "id": q_map[78]["id"],
        "old_answer": q_map[78]["correct_answer"],
        "new_answer": "D",
        "reason": "'The invention of vacuum tubes in the 1940s' is the subject, and 'ushered in the first generation of computers' functions as the predicate."
    },
    {
        "question_number": 86,
        "id": q_map[86]["id"],
        "old_answer": q_map[86]["correct_answer"],
        "new_answer": "B",
        "reason": "'Viguour' is incorrectly spelt; the correct spelling is 'Vigour' (or 'Vigor')."
    },
    {
        "question_number": 88,
        "id": q_map[88]["id"],
        "old_answer": q_map[88]["correct_answer"],
        "new_answer": "B",
        "reason": "'Inveterate' means deeply ingrained or chronic; its antonym is 'Casual'."
    },
    {
        "question_number": 89,
        "id": q_map[89]["id"],
        "old_answer": q_map[89]["correct_answer"],
        "new_answer": "C",
        "reason": "The idiom 'Break the fourth wall' means to address or acknowledge the audience directly."
    },
    {
        "question_number": 90,
        "id": q_map[90]["id"],
        "old_answer": q_map[90]["correct_answer"],
        "new_answer": "C",
        "reason": "'Somniferous' means sleep-inducing; its antonym is 'Stimulant'."
    }
]

print(f"Total changes identified: {len(changes)}")
for c in changes:
    print(f"Q{c['question_number']} (ID: {c['id']}): {c['old_answer']} -> {c['new_answer']} | {c['reason']}")
