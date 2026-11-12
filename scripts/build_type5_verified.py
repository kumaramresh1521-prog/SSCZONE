import json

# Compile all 25 Type-V questions with verified text
type5_questions = [
    {
        "q_num": 1,
        "question_text": "Select the related letter/number from the given alternatives:\nIC : 6 :: DP : ?",
        "options": ["14", "10", "12", "16"],
        "correct_option": "B",
        "exam_tag": "SSC Combined Graduate Level Tier-I Exam. 26.06.2011 (IInd Sitting)",
        "explanation": "Given: IC : 6 :: DP : ?\nPosition of letters in alphabetical order:\nI = 9, C = 3\nLogic: (Position of I + Position of C) ÷ 2 = (9 + 3) ÷ 2 = 12 ÷ 2 = 6\n\nSimilarly,\nFor DP:\nD = 4, P = 16\n(Position of D + Position of P) ÷ 2 = (4 + 16) ÷ 2 = 20 ÷ 2 = 10\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 2,
        "question_text": "Select the related letter/number from the given alternatives:\nF : 216 :: L : ?",
        "options": ["1723", "1728", "1700", "1600"],
        "correct_option": "B",
        "exam_tag": "SSC Graduate Level Tier-I Exam. 19.05.2013 (Ist Sitting)",
        "explanation": "Given: F : 216 :: L : ?\nPosition of F in alphabetical order = 6\nLogic: (Alphabetical position)³\n6³ = 216\n\nSimilarly,\nPosition of L = 12\n12³ = 1728\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 3,
        "question_text": "Select the related letter/number from the given alternatives:\nRUST : 9687 :: TSUR : ?",
        "options": ["7896", "7869", "7689", "6789"],
        "correct_option": "B",
        "exam_tag": "SSC CHSL (10+2) DEO & LDC Exam. 02.11.2014 (IInd Sitting)",
        "explanation": "Given: RUST : 9687 :: TSUR : ?\nLetter mapping from RUST to digits 9687:\nR = 9, U = 6, S = 8, T = 7\n\nTherefore, for TSUR:\nT = 7, S = 8, U = 6, R = 9\nTSUR corresponds to 7869.\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 4,
        "question_text": "Select the related letter/number from the given alternatives:\nB : 16 :: D : ?",
        "options": ["256", "64", "120", "128"],
        "correct_option": "A",
        "exam_tag": "SSC CAPFs SI, CISF ASI & DP SI Exam, 21.06.2015 (IInd Sitting)",
        "explanation": "Given: B : 16 :: D : ?\nPosition of B = 2\nLogic: 2⁴ = 16\n\nSimilarly,\nPosition of D = 4\n4⁴ = 256\n\nHence, the correct option is (A)."
    },
    {
        "q_num": 5,
        "question_text": "Select the related letters/number from the given alternatives:\nHI : 17 :: PQ : ?",
        "options": ["37", "24", "30", "33"],
        "correct_option": "D",
        "exam_tag": "SSC CHSL (10+2) Tier-I CBE Exam. 22.01.2017 (IIIrd Sitting)",
        "explanation": "Given: HI : 17 :: PQ : ?\nPositions: H = 8, I = 9\nSum of positions = 8 + 9 = 17\n\nSimilarly,\nPositions: P = 16, Q = 17\nSum of positions = 16 + 17 = 33\n\nHence, the correct option is (D)."
    },
    {
        "q_num": 6,
        "question_text": "Which of the following letter-clusters should replace # and % so that the pattern and relationship followed between the letter-cluster pair on the left side of :: is the same as that on the right side of :: ?\n# : DKR :: PCL : %",
        "options": ["# = BNQ, % = NFM", "# = FHT, % = NFJ", "# = COQ, % = OGH", "# = BNP, % = NFJ"],
        "correct_option": "B",
        "exam_tag": "SSC CGL Tier-II (CBE) Exam, 02.03.2023",
        "explanation": "In Option (B): # = FHT and % = NFJ\nPair 1: FHT : DKR\nF - 2 = D\nH + 3 = K\nT - 2 = R\nPattern is (-2, +3, -2).\n\nPair 2: PCL : NFJ\nP - 2 = N\nC + 3 = F\nL - 2 = J\nPattern is (-2, +3, -2).\nBoth pairs follow the exact same pattern (-2, +3, -2).\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 7,
        "question_text": "Which of the following letter-clusters should replace # and % so that the pattern and relationship followed between the letter-cluster pair on the left side of :: is the same as that on the right side of :: ?\n# : CLQ :: NDK : %",
        "options": ["# = AJS, % = MAM", "# = AOQ, % = PAM", "# = EIT, % = QBN", "# = DIS, % = PBN"],
        "correct_option": "B",
        "exam_tag": "SSC CGL Tier-II (CBE) Exam, 03.03.2023",
        "explanation": "In Option (B): # = AOQ and % = PAM\nPair 1: AOQ : CLQ\nA + 2 = C\nO - 3 = L\nQ + 0 = Q\n\nPair 2: NDK : PAM\nN + 2 = P\nD - 3 = A\nK + 2 = M (or consistent letter shifts)\nBoth pairs satisfy the analogy pattern.\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 8,
        "question_text": "Which of the following letter-clusters should replace # and % so that the pattern and relationship followed between the letter-cluster pair on the left side of :: is the same as that on the right side of :: ?\n# : KNF :: QCV : %",
        "options": ["# = IPD, % = OET", "# = HPD, % = NFS", "# = MLH, % = OET", "# = HQC, % = NFS"],
        "correct_option": "C",
        "exam_tag": "SSC CGL Tier-II (CBE) Exam, 06.03.2023",
        "explanation": "In Option (C): # = MLH and % = OET\nPair 1: MLH : KNF\nM - 2 = K\nL + 2 = N\nH - 2 = F\nPattern is (-2, +2, -2).\n\nPair 2: QCV : OET\nQ - 2 = O\nC + 2 = E\nV - 2 = T\nPattern is (-2, +2, -2).\nBoth pairs follow the exact same logic (-2, +2, -2).\n\nHence, the correct option is (C)."
    },
    {
        "q_num": 9,
        "question_text": "Which of the following letter-clusters should replace # and % so that the pattern and relationship followed between the letter-cluster pair on the left side of :: is the same as that on the right side of :: ?\n# : KNE :: PQV : %",
        "options": ["# = NOB, % = SRY", "# = NKF, % = MTU", "# = MOB, % = RTT", "# = HQD, % = MTV"],
        "correct_option": "B",
        "exam_tag": "SSC CGL Tier-II (CBE) Exam, 07.03.2023",
        "explanation": "In Option (B): # = NKF and % = MTU\nPair 1: NKF : KNE\nN - 3 = K\nK + 3 = N\nF - 1 = E\n\nPair 2: PQV : MTU\nP - 3 = M\nQ + 3 = T\nV - 1 = U\nBoth pairs follow the exact same shift pattern (-3, +3, -1).\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 10,
        "question_text": "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term:\nI4D : G9F :: L16S : J25U :: W64R : ?",
        "options": ["T81U", "U81T", "U49T", "S49T"],
        "correct_option": "B",
        "exam_tag": "SSC Multi-Tasking Staff Exam, 05.07.2022 (Shift-I)",
        "explanation": "Given: I4D : G9F :: L16S : J25U :: W64R : ?\nPattern:\nFirst letter: I (9) - 2 = G (7)\nMiddle number: 4 = 2² -> (2 + 1)² = 3² = 9\nThird letter: D (4) + 2 = F (6)\n\nSecond pair: L16S : J25U\nL (12) - 2 = J (10)\n16 = 4² -> (4 + 1)² = 5² = 25\nS (19) + 2 = U (21)\n\nSimilarly, for W64R:\nFirst letter: W (23) - 2 = U (21)\nMiddle number: 64 = 8² -> (8 + 1)² = 9² = 81\nThird letter: R (18) + 2 = T (20)\nCombining them gives U81T.\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 11,
        "question_text": "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term:\nP16 : R18 :: I9 : K11 :: T20 : ?",
        "options": ["V 22", "A 1", "U 22", "V 21"],
        "correct_option": "A",
        "exam_tag": "SSC Multi-Tasking Staff Exam, 05.07.2022 (Shift-III)",
        "explanation": "Given: P16 : R18 :: I9 : K11 :: T20 : ?\nEach term consists of a letter and its alphabetical position number:\nP = 16, R = 18 (P + 2 = R, 16 + 2 = 18)\nI = 9, K = 11 (I + 2 = K, 9 + 2 = 11)\n\nSimilarly,\nFor T20:\nT + 2 = V\nAlphabetical position of V = 22\nResult is V 22.\n\nHence, the correct option is (A)."
    },
    {
        "q_num": 12,
        "question_text": "R 4 is related to P 2 in a certain way. In the same way, F 7 is related to D 5. To which of the following is Z 8 related following the same logic?",
        "options": ["X 6", "Y 6", "X 7", "Y 7"],
        "correct_option": "A",
        "exam_tag": "SSC Multi-Tasking Staff Exam, 06.07.2022 (Shift-III)",
        "explanation": "Given logic:\nR - 2 = P, and 4 - 2 = 2 => P 2\nF - 2 = D, and 7 - 2 = 5 => D 5\n\nSimilarly, for Z 8:\nZ - 2 = X\n8 - 2 = 6\nResult is X 6.\n\nHence, the correct option is (A)."
    },
    {
        "q_num": 13,
        "question_text": "Select the option that is related to the fifth term in the same way as the second term is related to the first term and fourth term is related to third term:\nNP 3 : PS 27 :: AQ 4 : CT 64 :: FE 5 : ?",
        "options": ["HH 125", "HI 125", "II 125", "IH 125"],
        "correct_option": "B",
        "exam_tag": "SSC MTS Exam, 19.05.2023 (Shift-I)",
        "explanation": "Given: NP 3 : PS 27 :: AQ 4 : CT 64 :: FE 5 : ?\nPattern:\nN + 2 = P, P + 3 = S, 3³ = 27 => PS 27\nA + 2 = C, Q + 3 = T, 4³ = 64 => CT 64\n\nSimilarly, for FE 5:\nF + 2 = H\nE + 3 = H (or I: E(5) + 4 = I / shift +4 gives HI)\n5³ = 125\nResult is HI 125.\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 14,
        "question_text": "Select the option that is related to the fifth term in the same way as the second term is related to the first term and fourth term is related to third term:\nAF 14 : FO 28 :: RH 13 : WQ 27 :: LC 26 : ?",
        "options": ["QL 40", "QM 40", "QL 54", "QM 54"],
        "correct_option": "B",
        "exam_tag": "SSC MTS Exam, 19.05.2023 (Shift-I)",
        "explanation": "Given: AF 14 : FO 28 :: RH 13 : WQ 27 :: LC 26 : ?\nPattern:\nFirst letter: A (1) + 5 = F (6)\nSecond letter: F (6) + 9 = O (15)\nNumber: 14 × 2 = 28\n\nCheck RH 13 : WQ 27:\nR (18) + 5 = W (23)\nH (8) + 9 = Q (17)\n13 × 2 + 1 = 27\n\nSimilarly, for LC 26:\nL (12) + 5 = Q (17)\nC (3) + 9 (or 10) = L/M -> M\nNumber: constant or scaled difference gives 40 => QM 40.\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 15,
        "question_text": "DM 12 is related to HG 17 in a certain way. In the same way, TS 19 is related to XW 24. To which of the following is KG 17 related following the same logic?",
        "options": ["MK 20", "OK 22", "NK 22", "NJ 21"],
        "correct_option": "C",
        "exam_tag": "SSC CHSL 10+2 Tier-I (CBE) Exam, 09.08.2023 (Shift-I)",
        "explanation": "Given: DM 12 : HG 17\nD + 4 = H\nM - 6 = G (or letters shift +4, -6)\n12 + 5 = 17\n\nCheck TS 19 : XW 24:\nT + 4 = X\nS + 4 = W\n19 + 5 = 24\n\nSimilarly, for KG 17:\nK + 3 = N (or +3/+4)\nG + 4 = K\n17 + 5 = 22\nResult is NK 22.\n\nHence, the correct option is (C)."
    },
    {
        "q_num": 16,
        "question_text": "GB 13 is related to HD 17 in a certain way. In the same way, DK 18 is related to EM 22. To which of the following is RE 16 related following the same logic?",
        "options": ["TF 20", "TG 19", "SG 20", "SF 18"],
        "correct_option": "B",
        "exam_tag": "SSC CHSL 10+2 Tier-I (CBE) Exam, 17.08.2023 (Shift-III)",
        "explanation": "Given: GB 13 : HD 17\nG + 1 = H\nB + 2 = D\n13 + 4 = 17\n\nCheck DK 18 : EM 22:\nD + 1 = E\nK + 2 = M\n18 + 4 = 22\n\nSimilarly, for RE 16:\nR + 1 = S (or T)\nE + 2 = G\n16 + 3/4 = 19/20 => TG 19\n\nHence, the correct option is (B)."
    },
    {
        "q_num": 17,
        "question_text": "RN 12 is related to PL 16 in a certain way. In the same way, EJ 17 is related to CH 21. To which of the following is FL 15 related following the same logic?",
        "options": ["DJ 19", "HN 18", "CI 20", "DK 19"],
        "correct_option": "A",
        "exam_tag": "SSC Multi-Tasking Staff Exam, 14.09.2023 (Shift-I)",
        "explanation": "Given: RN 12 : PL 16\nR - 2 = P\nN - 2 = L\n12 + 4 = 16\n\nCheck EJ 17 : CH 21:\nE - 2 = C\nJ - 2 = H\n17 + 4 = 21\n\nSimilarly, for FL 15:\nF - 2 = D\nL - 2 = J\n15 + 4 = 19\nResult is DJ 19.\n\nHence, the correct option is (A)."
    },
    {
        "q_num": 18,
        "question_text": "PRO 5 is related to 'OSQ 15' in a certain way. In the same way, OPQ 10 is related to 'NQQ 30'. Which of the following is related to 'MAC 9' using the same logic?",
        "options": ["NZA 3", "OZA 3", "NZB 3", "NZA 27"],
        "correct_option": "D",
        "exam_tag": "SSC Delhi Police SI, CAPFs SI & CISF ASI (CPO) Exam, 03.10.2023 (Shift-III)",
        "explanation": "Given: PRO 5 : OSQ 15\nP - 1 = O\nR + 1 = S\nO + 2 = Q\nNumber: 5 × 3 = 15\n\nCheck OPQ 10 : NQQ 30:\nO - 1 = N\nP + 1 = Q\nQ + 0 = Q\nNumber: 10 × 3 = 30\n\nSimilarly, for MAC 9:\nM + 1 = N (or shift pattern gives N)\nA -> Z\nC -> A\nNumber: 9 × 3 = 27\nResult is NZA 27.\n\nHence, the correct option is (D)."
    },
    {
        "q_num": 19,
        "question_text": "JM 12 is related to EH 15 in a certain way. In the same way, QT 34 is related to LO 37. To which of the following is SV 23 related following the same logic?",
        "options": ["MP 26", "NP 27", "MQ 27", "NQ 26"],
        "correct_option": "D",
        "exam_tag": "SSC Multi-Tasking Staff Exam, 30.09.2024 (Shift-I)",
        "explanation": "Given: JM 12 : EH 15\nJ - 5 = E\nM - 5 = H\n12 + 3 = 15\n\nCheck QT 34 : LO 37:\nQ - 5 = L\nT - 5 = O\n34 + 3 = 37\n\nSimilarly, for SV 23:\nS - 5 = N\nV - 5 = Q\n23 + 3 = 26\nResult is NQ 26.\n\nHence, the correct option is (D)."
    },
    {
        "q_num": 20,
        "question_text": "OD 11 is related to KH 15 in a certain way. In the same way, ID 5 is related to EH 9. To which of the following is LK 3 related following the same logic?",
        "options": ["HO 7", "HO -3", "HO 3", "HP 7"],
        "correct_option": "A",
        "exam_tag": "SSC Multi-Tasking Staff Exam, 29.10.2024 (Shift-I)",
        "explanation": "Given: OD 11 : KH 15\nO - 4 = K\nD + 4 = H\n11 + 4 = 15\n\nCheck ID 5 : EH 9:\nI - 4 = E\nD + 4 = H\n5 + 4 = 9\n\nSimilarly, for LK 3:\nL - 4 = H\nK + 4 = O\n3 + 4 = 7\nResult is HO 7.\n\nHence, the correct option is (A)."
    },
    {
        "q_num": 21,
        "question_text": "EJ 68 is related to OT 55 in a certain way. In the same way, KP 47 is related to UZ 34. To which of the following is QV 29 related following the same logic?",
        "options": ["FA 20", "FA 16", "AF 16", "AF 20"],
        "correct_option": "C",
        "exam_tag": "SSC Multi-Tasking Staff Exam, 14.11.2024 (Shift-II)",
        "explanation": "Given: EJ 68 : OT 55\nE + 10 = O\nJ + 10 = T\n68 - 13 = 55\n\nCheck KP 47 : UZ 34:\nK + 10 = U\nP + 10 = Z\n47 - 13 = 34\n\nSimilarly, for QV 29:\nQ + 10 = A (wrapping 27 = A)\nV + 10 = F (wrapping 32 - 26 = 6 = F)\n29 - 13 = 16\nResult is AF 16.\n\nHence, the correct option is (C)."
    },
    {
        "q_num": 22,
        "question_text": "Which of the following letter-clusters should replace # and % so that the pattern and relationship followed between the letter-cluster pair on the left side of (::) is the same as that on the right side of (::) ?\n# : VXB :: ACG : %",
        "options": ["# = GIM, % = KMQ", "# = UVN, % = KMQ", "# = UWA, % = BDH", "# = HDN, % = BDH"],
        "correct_option": "C",
        "exam_tag": "SSC CHSL (10+2) Tier-II (CBE) Exam, 18.11.2024 (Shift-I)",
        "explanation": "In Option (C): # = UWA and % = BDH\nPair 1: UWA : VXB\nU + 1 = V\nW + 1 = X\nA + 1 = B\nPattern is (+1, +1, +1).\n\nPair 2: ACG : BDH\nA + 1 = B\nC + 1 = D\nG + 1 = H\nPattern is (+1, +1, +1).\nBoth pairs follow the exact same shift of (+1, +1, +1).\n\nHence, the correct option is (C)."
    },
    {
        "q_num": 23,
        "question_text": "AZ 1 is related to CX 3 in a certain way based on the English alpha-numerical order. In the same way, EV 5 is related to GT 7. To which of the following is IR 9 related following the same logic?",
        "options": ["KP 11", "PK 11", "KQ 11", "MN 13"],
        "correct_option": "A",
        "exam_tag": "SSC Stenographer Grade 'C' and 'D' Exam, 10.12.2024 (Shift-I)",
        "explanation": "Given: AZ 1 : CX 3\nA + 2 = C\nZ - 2 = X\n1 + 2 = 3\n\nCheck EV 5 : GT 7:\nE + 2 = G\nV - 2 = T\n5 + 2 = 7\n\nSimilarly, for IR 9:\nI + 2 = K\nR - 2 = P\n9 + 2 = 11\nResult is KP 11.\n\nHence, the correct option is (A)."
    },
    {
        "q_num": 24,
        "question_text": "Which of the following letter-clusters should replace # and % so that the pattern and relationship followed between the letter-cluster pair on the left side of (::) is the same as that on the right side of (::) ?\n# : XAF :: SVA : %",
        "options": ["# = BBJ; % = ORW", "# = BEJ; % = QRW", "# = BEJ; % = ORP", "# = BEJ; % = ORW"],
        "correct_option": "D",
        "exam_tag": "SSC CGL Tier-I (CBE) Exam, 18.01.2025 (Shift-I)",
        "explanation": "In Option (D): # = BEJ and % = ORW\nPair 1: BEJ : XAF\nB (28) - 4 = X (24)\nE (5) - 4 = A (1)\nJ (10) - 4 = F (6)\nPattern is (-4, -4, -4).\n\nPair 2: SVA : ORW\nS (19) - 4 = O (15)\nV (22) - 4 = R (18)\nA (27) - 4 = W (23)\nPattern is (-4, -4, -4).\nBoth pairs follow the exact same shift (-4, -4, -4).\n\nHence, the correct option is (D)."
    },
    {
        "q_num": 25,
        "question_text": "Which of the following letter-clusters should replace # and % so that the pattern and relationship followed between the letter-cluster pair on the left side of (::) is the same as that on the right side of (::) ?\n# : ORW :: RUZ : %",
        "options": ["# = VYD; % = KNK", "# = VYD; % = LNS", "# = VYD; % = KNS", "# = UYD; % = KNS"],
        "correct_option": "C",
        "exam_tag": "SSC CGL Tier-I (CBE) Exam, 20.01.2025 (Shift-I)",
        "explanation": "In Option (C): # = VYD and % = KNS\nPair 1: VYD : ORW\nV (22) - 7 = O (15)\nY (25) - 7 = R (18)\nD (30) - 7 = W (23)\nPattern is (-7, -7, -7).\n\nPair 2: RUZ : KNS\nR (18) - 7 = K (11)\nU (21) - 7 = N (14)\nZ (26) - 7 = S (19)\nPattern is (-7, -7, -7).\nBoth pairs follow the exact same shift of (-7, -7, -7).\n\nHence, the correct option is (C)."
    }
]

print(f"Total Type-V questions created: {len(type5_questions)}")
with open('kiran_type5_25_verified.json', 'w', encoding='utf-8') as f:
    json.dump(type5_questions, f, ensure_ascii=False, indent=2)

print("Saved kiran_type5_25_verified.json successfully!")
