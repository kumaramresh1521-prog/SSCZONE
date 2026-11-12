import json

changes = [
    {
        "question_number": 3,
        "id": 14504,
        "old_answer": "A",
        "new_answer": "D",
        "reason": "43 \u00d7 3 = 129, so similarly 62 \u00d7 3 = 186 (Option D)."
    },
    {
        "question_number": 9,
        "id": 14510,
        "old_answer": "A",
        "new_answer": "D",
        "reason": "From the given inequalities, all three conclusions I (M > L), II (Q \u2264 M), and III (S < R) are definitely true (Option D)."
    },
    {
        "question_number": 13,
        "id": 14514,
        "old_answer": "A",
        "new_answer": "C",
        "reason": "Each row forms consecutive decreasing 3-digit perfect squares: 19\u00b2 = 361, 18\u00b2 = 324, and 17\u00b2 = 289, so the missing digit is 9 (Option C)."
    },
    {
        "question_number": 14,
        "id": 14515,
        "old_answer": "A",
        "new_answer": "C",
        "reason": "The female members in the family are B (mother/wife of A), D (sister of A), and F (daughter of C), totaling 3 female members (Option C)."
    },
    {
        "question_number": 15,
        "id": 14516,
        "old_answer": "A",
        "new_answer": "D",
        "reason": "For 6-2-18, C = (6 + 2) \u00d7 2 = 16 \u2260 18, so 6-2-18 violates the pattern and is the wrong roll number (Option D)."
    },
    {
        "question_number": 29,
        "id": 14530,
        "old_answer": "A",
        "new_answer": "B",
        "reason": "Tent pegging is the cavalry equestrian sport where a rider on horseback pierces a small ground target with a lance or javelin (Option B)."
    },
    {
        "question_number": 30,
        "id": 14531,
        "old_answer": "D",
        "new_answer": "A",
        "reason": "Indian author Anuradha Roy won the 2016 DSC Prize for South Asian Literature for her novel 'Sleeping on Jupiter' (Option A)."
    },
    {
        "question_number": 32,
        "id": 14533,
        "old_answer": "A",
        "new_answer": "B",
        "reason": "Irish author John Banville won the 2005 Man Booker Prize for his novel 'The Sea' (Option B)."
    },
    {
        "question_number": 39,
        "id": 14540,
        "old_answer": "C",
        "new_answer": "B",
        "reason": "The 18 Mahapuranas were compiled into their extant written form during the Gupta period (Option B)."
    },
    {
        "question_number": 40,
        "id": 14541,
        "old_answer": "A",
        "new_answer": "D",
        "reason": "Tropical and subtropical moist broadleaf forest ecoregions in India encompass the Andaman Islands, Brahmaputra Valley, and Lower Gangetic Plains (Option D)."
    },
    {
        "question_number": 45,
        "id": 14546,
        "old_answer": "B",
        "new_answer": "C",
        "reason": "Article 131A (inserted by the 42nd Amendment and repealed by the 43rd Amendment) conferred exclusive jurisdiction on the Supreme Court regarding central laws (Option C)."
    },
    {
        "question_number": 47,
        "id": 14548,
        "old_answer": "A",
        "new_answer": "C",
        "reason": "Article 243ZI on incorporation of cooperative societies was inserted by the 97th Constitutional Amendment Act, 2011 (Option C)."
    },
    {
        "question_number": 48,
        "id": 14549,
        "old_answer": "C",
        "new_answer": "D",
        "reason": "In Article 1, 'Union of States' signifies that the Indian Union is not the result of an agreement among the states, nor do states have the right to secede (Option D)."
    },
    {
        "question_number": 49,
        "id": 14550,
        "old_answer": "B",
        "new_answer": "D",
        "reason": "Foreign investment consists of Foreign Direct Investment (FDI) and Foreign Institutional Investment (FII) (Option D)."
    },
    {
        "question_number": 53,
        "id": 14554,
        "old_answer": "B",
        "new_answer": "A",
        "reason": "Given a * b = a + b + ab, 3 * 5 = 23 and 2 * 4 = 14, so 3 * 5 - 2 * 4 = 23 - 14 = 9 (Option A)."
    },
    {
        "question_number": 64,
        "id": 14565,
        "old_answer": "A",
        "new_answer": "B",
        "reason": "With efficiency ratio A:B = 11:10, total work is 8 \u00d7 21 = 168 units; therefore B alone takes 168 / 10 = 16 4/5 days (Option B)."
    },
    {
        "question_number": 73,
        "id": 14574,
        "old_answer": "B",
        "new_answer": "A",
        "reason": "Arc length L = 45 - 2(12) = 21 cm, so central angle \u03b8 = L / r = 21 / 12 = 1.75 radians (Option A)."
    },
    {
        "question_number": 84,
        "id": 14585,
        "old_answer": "C",
        "new_answer": "A",
        "reason": "Subject 'The escalating climate crisis' requires predicate Q ('has intensified global efforts...'), giving the grammatically coherent order QPRS (Option A)."
    }
]

patch_data = {
    "paper_id": 27,
    "title": "SSC CGL 2026 Tier-I (Held On 1 October 2026 Shift 1)",
    "total_questions": 100,
    "changes_count": len(changes),
    "changes": changes
}

with open(r'c:\ssczone\scripts\verified_patches\patch_paper_27.json', 'w', encoding='utf-8') as f:
    json.dump(patch_data, f, indent=2, ensure_ascii=False)

print(f"Successfully created patch_paper_27.json with {len(changes)} changes.")
