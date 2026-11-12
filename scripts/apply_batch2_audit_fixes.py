import json
import re

def apply_batch2_fixes():
    with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data)} Batch 2 questions.")

    fixes_applied = []

    for q in data:
        qn = q['question_number']
        prompt = q.get('question_text', '')
        expl = q.get('explanation', '')
        tag = q.get('exam_tag', '')
        corr = q.get('correct_option', '')

        # ---------------------------------------------------------------------
        # 1. SPECIFIC QUESTION FIXES & MERGE ISSUES
        # ---------------------------------------------------------------------

        # Question 10: Clean explanation & verified Option C
        if qn == 10:
            corr = 'C'
            expl = (
                "48 : 196 :: 52 : ?\n"
                "(48 × 4) + 4 = 192 + 4 = 196\n\n"
                "Similarly,\n"
                "(52 × 4) + 4 = 208 + 4 = 212\n"
                "Hence, correct option is (C)."
            )
            fixes_applied.append(f"Q{qn}: Formatted clean explanation and confirmed Option (C) 212.")

        # Question 13: Cyclic shift verified
        if qn == 13:
            corr = 'D'
            expl = (
                "697 : 976 :: 532 : ?\n"
                "Logic: The first digit is shifted to the last position (cyclic shift): 697 -> 976.\n\n"
                "Similarly,\n"
                "In 532, moving 5 to the last position yields 325.\n"
                "Hence, Option (D) is 325."
            )
            fixes_applied.append(f"Q{qn}: Confirmed cyclic shift logic and Option (D) 325.")

        # Question 15: Remove trailing 69: 87:: 117:135
        if qn == 15:
            corr = 'D'
            expl = (
                "52 : 57 :: 46 : ?\n"
                "52 + 5 = 57\n\n"
                "Similarly,\n"
                "46 + 5 = 51\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Removed trailing '69: 87:: 117:135' and restored clean logic.")

        # Question 19: Remove Search on Tele and +3个
        if qn == 19:
            corr = 'A'
            expl = (
                "44 : 47 :: 58 : ?\n"
                "44 + 3 = 47\n\n"
                "Similarly,\n"
                "58 + 3 = 61\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Removed 'Search on Tele' and '+3个', formatted clean logic.")

        # Question 21: Confirmed -3 logic
        if qn == 21:
            corr = 'C'
            expl = (
                "354 : 351 :: 478 : ?\n"
                "354 - 3 = 351\n\n"
                "Similarly,\n"
                "478 - 3 = 475\n"
                "Hence, Option (C) is 475."
            )
            fixes_applied.append(f"Q{qn}: Confirmed subtract 3 logic and Option (C) 475.")

        # Question 25: Remove second line misprinted (3) 9 : (9 + 1)2 = 100...
        if qn == 25:
            corr = 'D'
            expl = (
                "33 : 38\n"
                "33 + 5 = 38\n\n"
                "Similarly,\n"
                "In Option (D): 13 : 18\n"
                "13 + 5 = 18\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Removed misprinted '(3) 9 : (9 + 1)2 = 100' text.")

        # Question 33: Clean ratio 3:7 and remove merged Q40 text
        if qn == 33:
            corr = 'A'
            expl = (
                "36 : 84\n"
                "36 = 12 × 3\n"
                "84 = 12 × 7 (Ratio 3 : 7)\n\n"
                "Similarly,\n"
                "In Option (A): 27 : 63\n"
                "27 = 9 × 3\n"
                "63 = 9 × 7 (Ratio 3 : 7)\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Cleaned ratio 3:7 and removed bleeding Q40 text.")

        # Question 37: Remove Search on Tele from prompt
        if qn == 37:
            prompt = re.sub(r'Search\s*on\s*Tele\s*\d*\.?\s*', '', prompt, flags=re.IGNORECASE).strip()
            fixes_applied.append(f"Q{qn}: Removed 'Search on Tele' from prompt.")

        # Question 40: Standardize powers 31² = 961, 29² = 841
        if qn == 40:
            expl = (
                "31² = 961 => 961 + 31 = 992\n\n"
                "Similarly,\n"
                "29² = 841 => 841 + 29 = 870\n\n"
                "(Note: For the given prompt pair 27 : 8, the logic is (8 × 3) + 3 = 27; "
                "similarly in Option (A): (3 × 3) + 3 = 12. Hence, correct option is (A))."
            )
            fixes_applied.append(f"Q{qn}: Formatted powers '31² = 961' and '29² = 841'.")

        # Question 42: Clean explanation: 17 × 6 = 102, 23 × 6 = 138
        if qn == 42:
            corr = 'C'
            expl = (
                "17 : 102 :: 23 : ?\n"
                "17 × 6 = 102\n\n"
                "Similarly,\n"
                "23 × 6 = 138\n"
                "Hence, correct option is (C)."
            )
            fixes_applied.append(f"Q{qn}: Cleaned explanation to '17 × 6 = 102 => 23 × 6 = 138'.")

        # Question 44: Standardize powers 9² + 9 = 90
        if qn == 44:
            corr = 'C'
            expl = (
                "9 : 90 :: 12 : ?\n"
                "9² + 9 = 81 + 9 = 90\n\n"
                "Similarly,\n"
                "12² + 12 = 144 + 12 = 156\n"
                "Hence, correct option is (C)."
            )
            fixes_applied.append(f"Q{qn}: Standardized powers '9² + 9 = 90' and '12² + 12 = 156'.")

        # Question 45: Remove trailing 15 : 240
        if qn == 45:
            corr = 'D'
            expl = (
                "3 : 30 :: 4 : ?\n"
                "3³ + 3 = 27 + 3 = 30\n\n"
                "Similarly,\n"
                "4³ + 4 = 64 + 4 = 68\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Removed trailing '15 : 240' and standardized cubes.")

        # Question 51: Fix powers 5² + 4² = 41 and 3² + 2² = 13
        if qn == 51:
            corr = 'B'
            expl = (
                "54 : 41 :: 32 : ?\n"
                "5² + 4² = 25 + 16 = 41\n\n"
                "Similarly,\n"
                "3² + 2² = 9 + 4 = 13\n"
                "Hence, correct option is (B)."
            )
            fixes_applied.append(f"Q{qn}: Fixed misprinted '2 (5)3 + (4)3:41' to clean '5² + 4² = 41'.")

        # Question 55: Remove trailing lines from Q56 and Q57
        if qn == 55:
            corr = 'D'
            expl = (
                "53 : 477\n"
                "53 × 9 = 477\n\n"
                "Similarly,\n"
                "In Option (D): 39 : 351\n"
                "39 × 9 = 351\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Removed trailing lines from Q56 and Q57.")

        # Question 67: Remove repeated Q68, Q69, Q70 text
        if qn == 67:
            corr = 'B'
            expl = (
                "18 : 323 :: 38 : ?\n"
                "18² - 1 = 324 - 1 = 323\n\n"
                "Similarly,\n"
                "38² - 1 = 1444 - 1 = 1443\n"
                "Hence, correct option is (B)."
            )
            fixes_applied.append(f"Q{qn}: Removed repeated solutions of Q68, Q69, Q70.")

        # Question 82: Remove merged Q83-Q86 text
        if qn == 82:
            corr = 'C'
            expl = (
                "52 : 221 :: 20 : ? :: 64 : 272\n"
                "52 × 4 + (52 ÷ 4) = 208 + 13 = 221\n"
                "64 × 4 + (64 ÷ 4) = 256 + 16 = 272\n\n"
                "Similarly,\n"
                "20 × 4 + (20 ÷ 4) = 80 + 5 = 85\n"
                "Hence, correct option is (C)."
            )
            fixes_applied.append(f"Q{qn}: Removed merged Q83-Q86 text from end of explanation.")

        # Question 87: Remove next question data 17:102 : 153
        if qn == 87:
            corr = 'A'
            expl = (
                "6 : 16 :: 20 : ? :: 11 : 81\n"
                "(6 - 2)² = 4² = 16\n"
                "(11 - 2)² = 9² = 81\n\n"
                "Similarly,\n"
                "(20 - 2)² = 18² = 324\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Removed trailing next question data '17:102 : 153'.")

        # Question 89: Fix power OCR typo (7-1)3 to (7-1)²
        if qn == 89:
            corr = 'D'
            expl = (
                "3 : 20 :: 7 : ?\n"
                "(3 - 1)² + (3 + 1)² = 2² + 4² = 4 + 16 = 20\n\n"
                "Similarly,\n"
                "(7 - 1)² + (7 + 1)² = 6² + 8² = 36 + 64 = 100\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Fixed power OCR typo '(7 - 1)3' to '(7 - 1)²'.")

        # Question 106: Verified
        if qn == 106:
            corr = 'B'
            expl = (
                "11 : 81 :: ? : 121 :: 8 : 36\n"
                "(11 - 2)² = 9² = 81\n"
                "(8 - 2)² = 6² = 36\n\n"
                "Similarly,\n"
                "(? - 2)² = 121 = 11² => ? - 2 = 11 => ? = 13\n"
                "Hence, Option (B) is 13."
            )
            fixes_applied.append(f"Q{qn}: Verified Option (B) 13.")

        # Question 122: Remove Search on Tele
        if qn == 122:
            corr = 'B'
            expl = (
                "4 : 80 :: 7 : 392 :: 5 : ?\n"
                "4² × 5 = 16 × 5 = 80\n"
                "7² × 8 = 49 × 8 = 392\n\n"
                "Similarly,\n"
                "5² × 6 = 25 × 6 = 150\n"
                "Hence, correct option is (B)."
            )
            fixes_applied.append(f"Q{qn}: Removed 'Search on Tele' and standardized powers.")

        # Question 138: Replace slash root /529 with √529
        if qn == 138:
            corr = 'D'
            expl = (
                "64 : 18 :: 196 : 24 :: 529 : ?\n"
                "(18 - 10)² = 8² = 64\n"
                "(24 - 10)² = 14² = 196\n\n"
                "Similarly,\n"
                "√529 = 23 => ? = 23 + 10 = 33\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Replaced '/529' with clean '√529 = 23'.")

        # Question 139: Replace slash root /2197 with clean ∛2197 = 13
        if qn == 139:
            corr = 'B'
            expl = (
                "8 : 508 :: ? : 2193 :: 2 : 4\n"
                "8³ - 4 = 512 - 4 = 508\n"
                "2³ - 4 = 8 - 4 = 4\n\n"
                "Similarly,\n"
                "?³ - 4 = 2193 => ?³ = 2197 => ? = ∛2197 = 13\n"
                "Hence, correct option is (B)."
            )
            fixes_applied.append(f"Q{qn}: Replaced '/2197' with clean '∛2197 = 13'.")

        # Question 140: Verified
        if qn == 140:
            corr = 'B'
            expl = (
                "16 : 576 :: 8 : 80 :: 22 : ?\n"
                "Logic: Let the first number be 2n. Then the second number is n² × (n + 1).\n"
                "For 16: 16/2 = 8 => 8² × (8 + 1) = 64 × 9 = 576.\n"
                "For 8: 8/2 = 4 => 4² × (4 + 1) = 16 × 5 = 80.\n\n"
                "Similarly,\n"
                "For 22: 22/2 = 11 => 11² × (11 + 1) = 121 × 12 = 1452.\n"
                "Hence, Option (B) is 1452."
            )
            fixes_applied.append(f"Q{qn}: Confirmed authentic logic and Option (B) 1452.")

        # Question 142: Verified
        if qn == 142:
            corr = 'B'
            expl = (
                "13 : 120 :: 17 : 152 :: 21 : ?\n"
                "8 × 13 + 16 = 104 + 16 = 120\n"
                "8 × 17 + 16 = 136 + 16 = 152\n\n"
                "Similarly,\n"
                "8 × 21 + 16 = 168 + 16 = 184\n"
                "Hence, Option (B) is 184."
            )
            fixes_applied.append(f"Q{qn}: Confirmed authentic logic and Option (B) 184.")

        # Question 144: Fix slash before 42
        if qn == 144:
            corr = 'A'
            expl = (
                "17 : 48 :: 23 : 66 :: 15 : ?\n"
                "(17 - 1) × 3 = 16 × 3 = 48\n"
                "(23 - 1) × 3 = 22 × 3 = 66\n\n"
                "Similarly,\n"
                "(15 - 1) × 3 = 14 × 3 = 42\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Removed typo slash before 42.")

        # Question 176: Verified
        if qn == 176:
            corr = 'B'
            expl = (
                "28 : 98 :: 36 : ?\n"
                "28² ÷ 8 = 784 ÷ 8 = 98\n\n"
                "Similarly,\n"
                "36² ÷ 8 = 1296 ÷ 8 = 162\n"
                "Hence, Option (B) is 162."
            )
            fixes_applied.append(f"Q{qn}: Verified Option (B) 162.")

        # Question 182: Remove stray math '2×2+9×2...' and clean explanation
        if qn == 182:
            corr = 'A'
            expl = (
                "84 : 72\n"
                "84 - (8 + 4) = 84 - 12 = 72\n\n"
                "Similarly,\n"
                "In Option (A): 68 : 54\n"
                "68 - (6 + 8) = 68 - 14 = 54\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Removed stray '2×2+9×2...' and formatted clean subtraction.")

        # Question 183: Remove stray math and clean explanation
        if qn == 183:
            corr = 'D'
            expl = (
                "6 : 32 :: 10 : ? :: 11 : 117\n"
                "6² - 4 = 36 - 4 = 32\n"
                "11² - 4 = 121 - 4 = 117\n\n"
                "Similarly,\n"
                "10² - 4 = 100 - 4 = 96\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Removed stray math from Q183 and standardized powers 10² - 4 = 96.")

        # Question 188: Verified
        if qn == 188:
            corr = 'D'
            expl = (
                "14 : 450\n"
                "(14 + 1)² × 2 = 15² × 2 = 225 × 2 = 450\n\n"
                "Similarly,\n"
                "In Option (D): 18 : 722\n"
                "(18 + 1)² × 2 = 19² × 2 = 361 × 2 = 722\n"
                "Hence, Option (D) is 18 : 722."
            )
            fixes_applied.append(f"Q{qn}: Verified Option (D) 18 : 722.")

        # Question 196: Verified
        if qn == 196:
            corr = 'D'
            expl = (
                "5 : 27 :: 7 : ? :: 8 : 39\n"
                "5 × 4 + 7 = 20 + 7 = 27\n"
                "8 × 4 + 7 = 32 + 7 = 39\n\n"
                "Similarly,\n"
                "7 × 4 + 7 = 28 + 7 = 35\n"
                "Hence, Option (D) is 35."
            )
            fixes_applied.append(f"Q{qn}: Verified Option (D) 35.")

        # Question 214: Remove merged Q215 and Q216 paragraph
        if qn == 214:
            corr = 'A'
            expl = (
                "115 : 163\n"
                "115 = 11² - 6\n"
                "163 = (11 + 2)² - 6 = 13² - 6 = 169 - 6 = 163\n\n"
                "Similarly,\n"
                "In Option (A): 43 : 75\n"
                "43 = 7² - 6\n"
                "75 = (7 + 2)² - 6 = 9² - 6 = 81 - 6 = 75\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Removed merged Q215 and Q216 text.")

        # Question 218: Clean prompt and explanation
        if qn == 218:
            prompt = re.sub(r'Search\s*on\s*Tele\s*\d*\.?\s*', '', prompt, flags=re.IGNORECASE).strip()
            fixes_applied.append(f"Q{qn}: Removed 'Search on Tele' from prompt.")

        # Question 221: Clean explanation and remove Search on Tele
        if qn == 221:
            corr = 'A'
            expl = (
                "7 : 84 :: 5 : ? :: 9 : 144\n"
                "7² × 2 - (7 × 2) = 98 - 14 = 84\n"
                "9² × 2 - (9 × 2) = 162 - 18 = 144\n\n"
                "Similarly,\n"
                "5² × 2 - (5 × 2) = 50 - 10 = 40\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Removed 'Search on Tele' and formatted clean calculation.")

        # Question 222: Remove merged Q223 text
        if qn == 222:
            corr = 'A'
            expl = (
                "8 : 36 :: 6 : ? :: 12 : 76\n"
                "(8² ÷ 2) + 4 = 32 + 4 = 36\n"
                "(12² ÷ 2) + 4 = 72 + 4 = 76\n\n"
                "Similarly,\n"
                "(6² ÷ 2) + 4 = 18 + 4 = 22\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Removed merged Q223 text from explanation.")

        # Question 230: Complete formula 18² + 17 = 341
        if qn == 230:
            corr = 'D'
            expl = (
                "12 : 181 :: 17 : ? :: 14 : 239\n"
                "(12 + 1)² + 12 = 13² + 12 = 169 + 12 = 181\n"
                "(14 + 1)² + 14 = 15² + 14 = 225 + 14 = 239\n\n"
                "Similarly,\n"
                "(17 + 1)² + 17 = 18² + 17 = 324 + 17 = 341\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Completed broken formula to '(17 + 1)² + 17 = 18² + 17 = 341'.")

        # Question 276: Verified
        if qn == 276:
            corr = 'C'
            expl = (
                "5 : 27 :: 7 : 51 :: 4 : ?\n"
                "5² + 2 = 25 + 2 = 27\n"
                "7² + 2 = 49 + 2 = 51\n\n"
                "Similarly,\n"
                "4² + 2 = 16 + 2 = 18\n"
                "Hence, Option (C) is 18."
            )
            fixes_applied.append(f"Q{qn}: Verified Option (C) 18.")

        # Question 278: Restore full prompt & clean explanation (remove Q277 duplicate)
        if qn == 278:
            prompt = (
                "529 is related to 23 following a certain logic. Following the same logic, 324 is related to 18. "
                "To which of the following is 625 related following the same logic? "
                "(NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into their constituent digits.)"
            )
            corr = 'D'
            expl = (
                "529 : 23 :: 324 : 18 :: 625 : ?\n"
                "Logic: Square root of the first number gives the second number.\n"
                "√529 = 23\n"
                "√324 = 18\n\n"
                "Similarly,\n"
                "√625 = 25\n"
                "Hence, Option (D) is 25."
            )
            fixes_applied.append(f"Q{qn}: Restored full prompt, removed Q277 duplicate, and set Option (D) 25.")

        # Question 284: Fix broken fractions 10 × (3/2) = 15, etc.
        if qn == 284:
            corr = 'C'
            expl = (
                "10 : 15 :: 42 : 63 :: 22 : ?\n"
                "10 × (3/2) = 15\n"
                "42 × (3/2) = 63\n\n"
                "Similarly,\n"
                "22 × (3/2) = 33\n"
                "Hence, correct option is (C)."
            )
            fixes_applied.append(f"Q{qn}: Fixed broken fractions to '10 × (3/2) = 15, 42 × (3/2) = 63, 22 × (3/2) = 33'.")

        # Question 285: Replace Q265 wrong explanation with authentic logic
        if qn == 285:
            corr = 'A'
            expl = (
                "104 : 13 :: 136 : 17 :: 232 : ?\n"
                "104 ÷ 8 = 13\n"
                "136 ÷ 8 = 17\n\n"
                "Similarly,\n"
                "232 ÷ 8 = 29\n"
                "Hence, correct option is (A)."
            )
            fixes_applied.append(f"Q{qn}: Replaced Q265 text with authentic logic: 104 ÷ 8 = 13, 232 ÷ 8 = 29 (Option A).")

        # Question 288: Verified
        if qn == 288:
            corr = 'A'
            expl = (
                "16 : 112 :: 26 : 182 :: 44 : ?\n"
                "16 × 7 = 112\n"
                "26 × 7 = 182\n\n"
                "Similarly,\n"
                "44 × 7 = 308\n"
                "Hence, Option (A) is 308."
            )
            fixes_applied.append(f"Q{qn}: Verified Option (A) 308.")

        # Question 289: Verified
        if qn == 289:
            corr = 'C'
            expl = (
                "8 : 512 :: 12 : 1728 :: 15 : ?\n"
                "8³ = 512\n"
                "12³ = 1728\n\n"
                "Similarly,\n"
                "15³ = 3375\n"
                "Hence, Option (C) is 3375."
            )
            fixes_applied.append(f"Q{qn}: Verified Option (C) 3375.")

        # Question 296: Replace old 529:577 explanation with authentic logic
        if qn == 296:
            corr = 'D'
            expl = (
                "28 : 168 :: 39 : 234 :: 43 : ?\n"
                "28 × 6 = 168\n"
                "39 × 6 = 234\n\n"
                "Similarly,\n"
                "43 × 6 = 258\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Replaced old 529:577 text with authentic logic: 28 × 6 = 168, 43 × 6 = 258 (Option D).")

        # Question 300: Strip Searchon Tele and clean explanation
        if qn == 300:
            prompt = re.sub(r'Searchon\s*Tele\s*\d*\.?\s*', '', prompt, flags=re.IGNORECASE).strip()
            corr = 'D'
            expl = (
                "14 : 200 :: 5 : 29\n"
                "14² + 4 = 196 + 4 = 200\n"
                "5² + 4 = 25 + 4 = 29\n\n"
                "Similarly,\n"
                "In Option (D): 16 : 260\n"
                "16² + 4 = 256 + 4 = 260\n"
                "Hence, correct option is (D)."
            )
            fixes_applied.append(f"Q{qn}: Removed 'Searchon Tele' from prompt and formatted clean explanation.")

        # ---------------------------------------------------------------------
        # 2. GLOBAL WATERMARK & JUNK REMOVAL
        # ---------------------------------------------------------------------
        prompt = re.sub(r'Search\s*on\s*Tele\w*', '', prompt, flags=re.IGNORECASE).strip()
        expl = re.sub(r'Search\s*on\s*Tele\w*', '', expl, flags=re.IGNORECASE).strip()
        tag = re.sub(r'Search\s*on\s*Tele\w*', '', tag, flags=re.IGNORECASE).strip()
        
        prompt = re.sub(r'K5279\/\d+', '', prompt).strip()
        expl = re.sub(r'K5279\/\d+', '', expl).strip()
        tag = re.sub(r'K5279\/\d+', '', tag).strip()
        
        expl = re.sub(r'\+3个', '+3', expl).strip()

        # ---------------------------------------------------------------------
        # 3. GLOBAL SPELLING REGULARIZATION: "Similarly"
        # ---------------------------------------------------------------------
        expl = re.sub(
            r'\b(stmilarly|similarty|simlarly|simllarty|sumllarty|smilarly|simflarty|simiary)\b',
            'Similarly',
            expl,
            flags=re.IGNORECASE
        )

        # ---------------------------------------------------------------------
        # 4. GLOBAL POWER / EXPONENT STANDARDIZATION
        # ---------------------------------------------------------------------
        expl = re.sub(r'\((\d+)\)\s*2', r'(\1)²', expl)
        expl = re.sub(r'\((\d+)\)\s*3', r'(\1)³', expl)
        expl = re.sub(r'\((\d+)\)\s*4', r'(\1)⁴', expl)
        expl = re.sub(r'\((\d+)\)\s*[pP]', r'(\1)²', expl)
        expl = re.sub(r'\((\d+)[pP]', r'(\1)²', expl)
        
        expl = re.sub(r'(\d+)[\'\"\*°]\s*-\s*(\d+)', r'\1² - \2', expl)
        expl = re.sub(r'(\d+)[\'\"\*°]\s*\+\s*(\d+)', r'\1² + \2', expl)
        
        expl = re.sub(r'\b312\s*=\s*961', '31² = 961', expl)
        expl = re.sub(r'\b292\s*=\s*841', '29² = 841', expl)
        expl = re.sub(r'\b252\s*=\s*625', '25² = 625', expl)
        expl = re.sub(r'\b182\s*-\s*18', '18² - 18', expl)
        expl = re.sub(r'\b252\s*-\s*25', '25² - 25', expl)

        # Root slash standardization
        expl = re.sub(r'=\s*\/(\d+)', r'= √\1', expl)
        expl = re.sub(r'(?<=\s)\/(\d+)', r'√\1', expl)

        # ---------------------------------------------------------------------
        # 5. EXAM TAG CLEANUP
        # ---------------------------------------------------------------------
        tag = re.sub(r'\bEcam\b', 'Exam', tag, flags=re.IGNORECASE)
        tag = re.sub(r'TFNo\.\d+.*', '', tag)
        tag = re.sub(r'\s+\d{1,3}\s*[\.:]\s*(?:Select|Choose|In|Find|Give|The|Which|What|How).*$', '', tag, flags=re.IGNORECASE)
        tag = re.sub(r'\s+(?:Select\s+the|Choose\s+the).*$', '', tag, flags=re.IGNORECASE)
        tag = re.sub(r'\s*\(NOTE\s*:.*$', '', tag, flags=re.IGNORECASE)
        tag = re.sub(r'\s*Search\s*on\s*Tele\w*', '', tag, flags=re.IGNORECASE)
        tag = tag.strip().rstrip(';,.- ')
        if tag and not tag.startswith('(') and not tag.startswith('['):
            tag = '(' + tag
        if tag and not tag.endswith(')') and not tag.endswith(']'):
            tag = tag + ')'

        # Save back
        q['question_text'] = prompt
        q['explanation'] = expl
        q['exam_tag'] = tag
        q['correct_option'] = corr

    with open('kiran_type2_307_verified.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Successfully updated 'kiran_type2_307_verified.json'.")
    print(f"Total specific fixes tracked: {len(fixes_applied)}")

if __name__ == '__main__':
    apply_batch2_fixes()
