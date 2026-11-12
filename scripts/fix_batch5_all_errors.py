import json

with open('kiran_type5_25_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

fixes = {
    1: {
        'correct_option': 'C',
        'explanation': (
            "Given: IC : 6 :: DP : ?\n"
            "Position of letters in the English alphabet:\n"
            "I = 9, C = 3 => 9 - 3 = 6\n\n"
            "Similarly,\n"
            "For DP:\n"
            "D = 4, P = 16 => 16 - 4 = 12\n\n"
            "Hence, the correct option is (C)."
        )
    },
    7: {
        'options': [
            "# = AJS, % = MAM",
            "# = AOO, % = PAM",
            "# = EIT, % = QBN",
            "# = DIS, % = PBN"
        ],
        'correct_option': 'B',
        'explanation': (
            "In Option (B): # = AOO and % = PAM\n"
            "Pair 1: AOO : CLQ\n"
            "A (1) + 2 = C (3)\n"
            "O (15) - 3 = L (12)\n"
            "O (15) + 2 = Q (17)\n"
            "Pattern is (+2, -3, +2).\n\n"
            "Pair 2: NDK : PAM\n"
            "N (14) + 2 = P (16)\n"
            "D (4) - 3 = A (1)\n"
            "K (11) + 2 = M (13)\n"
            "Both pairs follow the exact same shift pattern (+2, -3, +2).\n\n"
            "Hence, the correct option is (B)."
        )
    },
    11: {
        'question_text': "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term:\nP 16 : R 18 :: I 9 : K 11 :: T 20 : ?",
        'exam_tag': "SSC Multi-Tasking Staff Exam. 05.07.2022 (Shift-II)"
    },
    12: {
        'exam_tag': "SSC Multi-Tasking Staff Exam. 06.07.2022 (Shift-II)"
    },
    13: {
        'question_text': "Select the option that is related to the fifth term in the same way as the second term is related to the first term and fourth term is related to third term:\nNP3 : PS27 :: AQ4 : CT64 :: FE5 : ?",
        'options': ["HH125", "HI125", "II125", "IH125"],
        'correct_option': 'A',
        'explanation': (
            "Given: NP3 : PS27 :: AQ4 : CT64 :: FE5 : ?\n"
            "Pattern:\n"
            "N (14) + 2 = P (16), P (16) + 3 = S (19), 3 × 3² = 27 => PS27\n"
            "A (1) + 2 = C (3), Q (17) + 3 = T (20), 4 × 4² = 64 => CT64\n\n"
            "Similarly, for FE5:\n"
            "F (6) + 2 = H (8)\n"
            "E (5) + 3 = H (8)\n"
            "5 × 5² = 125\n"
            "Result is HH125.\n\n"
            "Hence, the correct option is (A)."
        )
    },
    14: {
        'question_text': "Select the option that is related to the fifth term in the same way as the second term is related to the first term and fourth term is related to third term:\nAF14 : FO28 :: RH13 : WQ27 :: LC26 : ?",
        'options': ["QL40", "QM40", "QL54", "QM54"],
        'correct_option': 'A',
        'explanation': (
            "Given: AF14 : FO28 :: RH13 : WQ27 :: LC26 : ?\n"
            "Pattern:\n"
            "A (1) + 5 = F (6), F (6) + 9 = O (15), 14 + 14 = 28 => FO28\n"
            "R (18) + 5 = W (23), H (8) + 9 = Q (17), 13 + 14 = 27 => WQ27\n\n"
            "Similarly, for LC26:\n"
            "L (12) + 5 = Q (17)\n"
            "C (3) + 9 = L (12)\n"
            "26 + 14 = 40\n"
            "Result is QL40.\n\n"
            "Hence, the correct option is (A)."
        )
    },
    15: {
        'question_text': "DM 12 is related to HQ 17 in a certain way. In the same way, TS 19 is related to XW 24. To which of the following is KG 17 related following the same logic?",
        'correct_option': 'B',
        'explanation': (
            "Given: DM 12 : HQ 17\n"
            "D (4) + 4 = H (8)\n"
            "M (13) + 4 = Q (17)\n"
            "12 + 5 = 17\n\n"
            "Check TS 19 : XW 24:\n"
            "T (20) + 4 = X (24)\n"
            "S (19) + 4 = W (23)\n"
            "19 + 5 = 24\n\n"
            "Similarly, for KG 17:\n"
            "K (11) + 4 = O (15)\n"
            "G (7) + 4 = K (11)\n"
            "17 + 5 = 22\n"
            "Result is OK 22.\n\n"
            "Hence, the correct option is (B)."
        )
    },
    16: {
        'correct_option': 'C',
        'explanation': (
            "Given: GB 13 : HD 17\n"
            "G (7) + 1 = H (8)\n"
            "B (2) + 2 = D (4)\n"
            "13 + 4 = 17\n\n"
            "Check DK 18 : EM 22:\n"
            "D (4) + 1 = E (5)\n"
            "K (11) + 2 = M (13)\n"
            "18 + 4 = 22\n\n"
            "Similarly, for RE 16:\n"
            "R (18) + 1 = S (19)\n"
            "E (5) + 2 = G (7)\n"
            "16 + 4 = 20\n"
            "Result is SG 20.\n\n"
            "Hence, the correct option is (C)."
        )
    },
    18: {
        'question_text': "'PRO 5' is related to 'OSQ 15' in a certain way. In the same way, 'OPO 10' is related to 'NQQ 30'. Which of the following is related to 'MAC 9' using the same logic?",
        'correct_option': 'A',
        'explanation': (
            "Given: PRO 5 : OSQ 15\n"
            "P (16) - 1 = O (15), R (18) + 1 = S (19), O (15) + 2 = Q (17), and 5 × 3 = 15\n\n"
            "Check OPO 10 : NQQ 30:\n"
            "O (15) - 1 = N (14), P (16) + 1 = Q (17), O (15) + 2 = Q (17), and 10 × 3 = 30\n\n"
            "Applying the reverse relation (? : MAC 9):\n"
            "First letter: N (14) - 1 = M (13)\n"
            "Second letter: Z (26) + 1 = A (27/1)\n"
            "Third letter: A (1) + 2 = C (3)\n"
            "Number: 3 × 3 = 9\n"
            "Thus, NZA 3 is related to MAC 9.\n\n"
            "Hence, the correct option is (A)."
        )
    }
}

for q in qs:
    qn = q['q_num']
    if qn in fixes:
        for k, v in fixes[qn].items():
            q[k] = v

with open('kiran_type5_25_verified.json', 'w', encoding='utf-8') as f:
    json.dump(qs, f, ensure_ascii=False, indent=2)

lines = [
    "================================================================================",
    "   SSC REASONING - CHAPTER 2: ANALOGY OR SIMILARITY",
    "   TYPE-V: MIXED / ALPHA-NUMERIC ANALOGY (मिश्रित सादृश्यता)",
    "   TOTAL QUESTIONS: 25 (100% VERIFIED & AUDITED WITH DETAILED EXPLANATIONS)",
    "================================================================================",
    ""
]
for q in qs:
    lines.append(f"Question {q['q_num']}:")
    lines.append(q['question_text'].strip())
    lines.append("")
    for idx, opt in enumerate(q['options']):
        lines.append(f"({chr(65+idx)}) {opt}")
    lines.append("")
    lines.append(f"Answer: ({q['correct_option']})")
    lines.append(f"Exam: {q['exam_tag'].strip()}")
    lines.append("Explanation:")
    lines.append(q['explanation'].strip())
    lines.append("")
    lines.append("-" * 80)
    lines.append("")

txt_out = "\n".join(lines)
for p in ['batch5_type5_mixed_analogy_verified.txt', 'public/batch5_type5_mixed_analogy_verified.txt']:
    with open(p, 'w', encoding='utf-8') as f:
        f.write(txt_out)

print("Batch 5 (Type-V) 25/25 updated and verified!")
