import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

# ==========================================
# 1. APPLY USER-VERIFIED 15 QUESTIONS
# ==========================================

# Q33
by_num[33]['question_text'] = 'Select the number-pair in which the two numbers are related in the same way as are the two numbers of the following number-pair. 36 : 84'
by_num[33]['option_a'] = '(27, 63)'
by_num[33]['option_b'] = '(21, 51)'
by_num[33]['option_c'] = '(57, 135)'
by_num[33]['option_d'] = '(45, 95)'
by_num[33]['correct_option'] = 'A'
by_num[33]['explanation'] = """36 : 84
Ratio is 36 : 84 => 3 : 7 (Divided by 12)

Similarly,
In Option (A): 27 : 63
Ratio is 27 : 63 => 3 : 7 (Divided by 9)
Hence, correct option is (A)."""

# Q34
by_num[34]['question_text'] = 'Select the number-pair in which the two numbers are related in the same way as are the two numbers of the following number-pair. 4 : 32'
by_num[34]['option_a'] = '8 : 248'
by_num[34]['option_b'] = '5 : 62'
by_num[34]['option_c'] = '10 : 160'
by_num[34]['option_d'] = '6 : 108'
by_num[34]['correct_option'] = 'D'
by_num[34]['explanation'] = """4 : 32 
Logic: 4³ ÷ 2 = 64 ÷ 2 = 32

Similarly,
In Option (D): 6 : 108
6³ ÷ 2 = 216 ÷ 2 = 108
Hence, correct option is (D)."""

# Q35
by_num[35]['question_text'] = 'Select the option that is related to the third term in the same way as the second term is related to the first term. 29 : 13 :: 37 : ?'
by_num[35]['option_a'] = '15'
by_num[35]['option_b'] = '21'
by_num[35]['option_c'] = '17'
by_num[35]['option_d'] = '14'
by_num[35]['correct_option'] = 'C'
by_num[35]['explanation'] = """29 : 13
Logic: (First Number - 3) ÷ 2 = Second Number
(29 - 3) ÷ 2 = 26 ÷ 2 = 13

Similarly,
(37 - 3) ÷ 2 = 34 ÷ 2 = 17
Hence, correct option is (C)."""

# Q36
by_num[36]['question_text'] = 'Select the number-pair in which the two numbers are related in the same way as are the two numbers of the following number-pair. 28 : 63'
by_num[36]['option_a'] = '(16, 36)'
by_num[36]['option_b'] = '(36, 78)'
by_num[36]['option_c'] = '(12, 28)'
by_num[36]['option_d'] = '(48, 98)'
by_num[36]['correct_option'] = 'A'
by_num[36]['explanation'] = """28 : 63
Ratio is 28 : 63 => 4 : 9 (Divided by 7)

Similarly,
In Option (A): 16 : 36
Ratio is 16 : 36 => 4 : 9 (Divided by 4)
Hence, correct option is (A)."""

# Q37
by_num[37]['question_text'] = 'Select the number-pair in which the two numbers are related in the same way as the two numbers of the pair given below: 35 : 5'
by_num[37]['option_a'] = '(63, 7)'
by_num[37]['option_b'] = '(135, 12)'
by_num[37]['option_c'] = '(99, 10)'
by_num[37]['option_d'] = '(48, 7)'
by_num[37]['correct_option'] = 'A'
by_num[37]['explanation'] = """35 : 5
Logic: Second Number × (Second Number + 2) = First Number
5 × (5 + 2) = 5 × 7 = 35

Similarly,
In Option (A): 63 : 7
7 × (7 + 2) = 7 × 9 = 63
Hence, correct option is (A)."""

# Q38
by_num[38]['question_text'] = 'Select the number-pair in which the two numbers are related in the same way as are the two numbers of the following number-pair. 12 : 42'
by_num[38]['option_a'] = '(15, 52)'
by_num[38]['option_b'] = '(24, 82)'
by_num[38]['option_c'] = '(8, 28)'
by_num[38]['option_d'] = '(16, 53)'
by_num[38]['correct_option'] = 'C'
by_num[38]['explanation'] = """12 : 42
Logic: First Number × 3.5 = Second Number
12 × 3.5 = 42

Similarly,
In Option (C): 8 : 28
8 × 3.5 = 28
Hence, correct option is (C)."""

# Q41
by_num[41]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 12 : 68 :: 21 : ?'
by_num[41]['option_a'] = '49'
by_num[41]['option_b'] = '117'
by_num[41]['option_c'] = '119'
by_num[41]['option_d'] = '79'
by_num[41]['correct_option'] = 'C'
by_num[41]['explanation'] = """12 : 68
Ratio is 12 : 68 => 3 : 17 (Divided by 4)

Similarly,
21 : ? => 3 : 17
Since 21 = 3 × 7, the required number must be 17 × 7 = 119.
Hence, Option (C) is correct."""

# Q51
by_num[51]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 54 : 41 :: 32 : ?'
by_num[51]['option_a'] = '29'
by_num[51]['option_b'] = '13'
by_num[51]['option_c'] = '17'
by_num[51]['option_d'] = '11'
by_num[51]['correct_option'] = 'B'
by_num[51]['explanation'] = """54 : 41
Logic: Sum of squares of digits of the first number = Second Number
5² + 4² = 25 + 16 = 41

Similarly,
3² + 2² = 9 + 4 = 13
Hence, correct option is (B)."""

# Q181
by_num[181]['question_text'] = 'Select the option in which the numbers share the same relationship as that shared by the given pair of numbers. 7 : 198'
by_num[181]['option_a'] = '9 : 162'
by_num[181]['option_b'] = '5 : 240'
by_num[181]['option_c'] = '6 : 72'
by_num[181]['option_d'] = '8 : 228'
by_num[181]['correct_option'] = 'D'
by_num[181]['explanation'] = """7 : 198
Logic: (First Number × 10 - 4) × 3 = Second Number
(7 × 10 - 4) × 3 = (70 - 4) × 3 = 66 × 3 = 198

Similarly,
In Option (D): 8 : 228
(8 × 10 - 4) × 3 = (80 - 4) × 3 = 76 × 3 = 228
Hence, correct option is (D)."""

# Q186
by_num[186]['question_text'] = 'Select the option that is related to the third term in the same way as the second term is related to the first term and sixth term is related to fifth term. 3 : 8 :: 6 : ? :: 11 : 1000'
by_num[186]['option_a'] = '216'
by_num[186]['option_b'] = '512'
by_num[186]['option_c'] = '125'
by_num[186]['option_d'] = '729'
by_num[186]['correct_option'] = 'C'
by_num[186]['explanation'] = """3 : 8
Logic: (First Number - 1)³ = Second Number
(3 - 1)³ = 2³ = 8

11 : 1000
(11 - 1)³ = 10³ = 1000

Similarly,
6 : ?
(6 - 1)³ = 5³ = 125
Hence, correct option is (C)."""

# Q201
by_num[201]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 13 : 1728 :: 17 : ?'
by_num[201]['option_a'] = '1928'
by_num[201]['option_b'] = '4096'
by_num[201]['option_c'] = '3218'
by_num[201]['option_d'] = '2043'
by_num[201]['correct_option'] = 'B'
by_num[201]['explanation'] = """13 : 1728
Logic: (First Number - 1)³ = Second Number
(13 - 1)³ = 12³ = 1728

Similarly,
17 : ?
(17 - 1)³ = 16³ = 4096
Hence, correct option is (B)."""

# Q221
by_num[221]['question_text'] = 'Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 7 : 84 :: 5 : ? :: 9 : 144'
by_num[221]['option_a'] = '40'
by_num[221]['option_b'] = '30'
by_num[221]['option_c'] = '36'
by_num[221]['option_d'] = '45'
by_num[221]['correct_option'] = 'A'
by_num[221]['explanation'] = """7 : 84
Logic: First Number² × 2 - (First Number × 2) = Second Number
7² × 2 - (7 × 2) = 98 - 14 = 84

9 : 144
9² × 2 - (9 × 2) = 162 - 18 = 144

Similarly,
5 : ?
5² × 2 - (5 × 2) = 50 - 10 = 40
Hence, correct option is (A)."""

# Q222
by_num[222]['question_text'] = 'Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 8 : 36 :: 6 : ? :: 12 : 76'
by_num[222]['option_a'] = '22'
by_num[222]['option_b'] = '20'
by_num[222]['option_c'] = '27'
by_num[222]['option_d'] = '24'
by_num[222]['correct_option'] = 'A'
by_num[222]['explanation'] = """8 : 36
Logic: (First Number² ÷ 2) + 4 = Second Number
(8² ÷ 2) + 4 = 32 + 4 = 36

12 : 76
(12² ÷ 2) + 4 = 72 + 4 = 76

Similarly,
6 : ?
(6² ÷ 2) + 4 = 18 + 4 = 22
Hence, correct option is (A)."""

# Q230
by_num[230]['question_text'] = 'Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 12 : 181 :: 17 : ? :: 14 : 239'
by_num[230]['option_a'] = '350'
by_num[230]['option_b'] = '335'
by_num[230]['option_c'] = '359'
by_num[230]['option_d'] = '341'
by_num[230]['correct_option'] = 'D'
by_num[230]['explanation'] = """12 : 181
Logic: (First Number + 1)² + First Number = Second Number
(12 + 1)² + 12 = 13² + 12 = 169 + 12 = 181

14 : 239
(14 + 1)² + 14 = 15² + 14 = 225 + 14 = 239

Similarly,
17 : ?
(17 + 1)² + 17 = 18² + 17 = 324 + 17 = 341
Hence, correct option is (D)."""

# Q284
by_num[284]['question_text'] = 'In the following number-pairs, the second number is obtained by applying certain mathematical operations to the first number. Select the set in which the numbers are related in the same way as are the numbers of the following sets. 10 : 15 :: 42 : 63 :: 22 : ?'
by_num[284]['option_a'] = '28'
by_num[284]['option_b'] = '30'
by_num[284]['option_c'] = '33'
by_num[284]['option_d'] = '31'
by_num[284]['correct_option'] = 'C'
by_num[284]['explanation'] = """10 : 15
Logic: First Number × (3/2) = Second Number
10 × (3/2) = 15

42 : 63
42 × (3/2) = 63

Similarly,
22 : ?
22 × (3/2) = 33
Hence, correct option is (C)."""

# ==========================================
# 2. ADDITIONAL CRITICAL ERRORS CAUGHT IN AUDIT
# ==========================================

# Q40: Official answer is (A: 12 : 3)
by_num[40]['question_text'] = 'Select the number-pair in which the two numbers are related in the same way as are the two numbers of the following number-pair. 27 : 8'
by_num[40]['correct_option'] = 'A'
by_num[40]['explanation'] = """27 : 8
Logic: (Second Number × 3) + 3 = First Number
(8 × 3) + 3 = 24 + 3 = 27

Similarly,
In Option (A): 12 : 3
(3 × 3) + 3 = 9 + 3 = 12
Hence, correct option is (A)."""

# Q82: Answer is (D: 85)
by_num[82]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number and the sixth number is related to the fifth number. 52 : 221 :: 20 : ? :: 64 : 272'
by_num[82]['correct_option'] = 'D'
by_num[82]['explanation'] = """52 : 221 :: 20 : ? :: 64 : 272
Logic: First Number × 4 + (First Number ÷ 4) = Second Number
52 × 4 + (52 ÷ 4) = 208 + 13 = 221
64 × 4 + (64 ÷ 4) = 256 + 16 = 272

Similarly,
20 × 4 + (20 ÷ 4) = 80 + 5 = 85
Hence, correct option is (D)."""

# Q95: Logic is x^3 : x^2
by_num[95]['question_text'] = 'Select the option in which the numbers share the same relationship as that shared by the given pair of numbers. 512 : 64'
by_num[95]['correct_option'] = 'D'
by_num[95]['explanation'] = """512 : 64
Logic: x³ : x²
8³ : 8² = 512 : 64

Similarly,
In Option (D): 1331 : 121
11³ : 11² = 1331 : 121
Hence, correct option is (D)."""

# Q105: Official answer is (C: 12)
by_num[105]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 39 : 27 :: 43 : ?'
by_num[105]['correct_option'] = 'C'
by_num[105]['explanation'] = """39 : 27 :: 43 : ?
Logic: Product of the digits of the first number = Second Number
3 × 9 = 27

Similarly,
4 × 3 = 12
Hence, correct option is (C)."""

# Q122: Answer is (D: 150)
by_num[122]['question_text'] = 'Select the option that is related to the fifth number in the same way as the second number is related to the first number and the fourth number is related to the third number. 4 : 80 :: 7 : 392 :: 5 : ?'
by_num[122]['correct_option'] = 'D'
by_num[122]['explanation'] = """4 : 80 :: 7 : 392 :: 5 : ?
Logic: First Number² × (First Number + 1) = Second Number
4² × (4 + 1) = 16 × 5 = 80
7² × (7 + 1) = 49 × 8 = 392

Similarly,
5² × (5 + 1) = 25 × 6 = 150
Hence, correct option is (D)."""

# Q174: Product of digits / 2 = 20 (Option D)
by_num[174]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 2931 : 27 :: 5142 : ?'
by_num[174]['correct_option'] = 'D'
by_num[174]['explanation'] = """2931 : 27 :: 5142 : ?
Logic: (Product of all digits of first number) ÷ 2 = Second Number
(2 × 9 × 3 × 1) ÷ 2 = 54 ÷ 2 = 27

Similarly,
(5 × 1 × 4 × 2) ÷ 2 = 40 ÷ 2 = 20
Hence, correct option is (D)."""

# Q198: Each digit +1 -> 6827 (Option B)
by_num[198]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 3824 : 4935 :: 5716 : ?'
by_num[198]['correct_option'] = 'B'
by_num[198]['explanation'] = """3824 : 4935 :: 5716 : ?
Logic: Each digit of the first number is increased by 1 (+1111) to get the second number:
3824 + 1111 = 4935

Similarly,
5716 + 1111 = 6827
Hence, correct option is (B)."""

# Q210: a^2 + (a+1)^2 = 313 (Option C)
by_num[210]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 6 : 85 :: 12 : ?'
by_num[210]['correct_option'] = 'C'
by_num[210]['explanation'] = """6 : 85 :: 12 : ?
Logic: First Number² + (First Number + 1)² = Second Number
6² + (6 + 1)² = 36 + 49 = 85

Similarly,
12² + (12 + 1)² = 144 + 169 = 313
Hence, correct option is (C)."""

# Q211: N^2 * 2 = 392 (Option B)
by_num[211]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 11 : 242 :: 14 : ?'
by_num[211]['correct_option'] = 'B'
by_num[211]['explanation'] = """11 : 242 :: 14 : ?
Logic: First Number² × 2 = Second Number
11² × 2 = 121 × 2 = 242

Similarly,
14² × 2 = 196 × 2 = 392
Hence, correct option is (B)."""

# Q214: Option D is 43 : 75
by_num[214]['question_text'] = 'Select the option in which the number-pair shares the same relationship as that shared by the given number-pair. 115 : 163'
by_num[214]['correct_option'] = 'D'
by_num[214]['explanation'] = """115 : 163
Logic: 115 = 11² - 6
163 = (11 + 2)² - 6 = 13² - 6 = 169 - 6 = 163

Similarly,
In Option (D): 43 : 75
43 = 7² - 6
75 = (7 + 2)² - 6 = 9² - 6 = 81 - 6 = 75
Hence, correct option is (D)."""

# Q217: Permutation ABCD -> BCAD, ? -> 2174 gives 7214 (Option C)
by_num[217]['question_text'] = 'Select the option that is related to the sixth number in the same way as the first number is related to the second number and third number is related to fourth number. 8432 : 4382 :: 2496 : 4926 :: ? : 2174'
by_num[217]['correct_option'] = 'C'
by_num[217]['explanation'] = """8432 : 4382 :: 2496 : 4926 :: ? : 2174
Logic: The digits of the first number ABCD are rearranged to BCAD:
8432 (ABCD) -> 4382 (BCAD)
2496 (ABCD) -> 4926 (BCAD)

Similarly, for ? : 2174 (where result is BCAD = 2174):
B = 2, C = 1, A = 7, D = 4
Therefore, the first number ABCD must be 7214.
Hence, correct option is (C)."""

# Q224: Clean up -9 logic
by_num[224]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number and the sixth number is related to the fifth number. 17 : -153 :: -13 : ? :: -21 : 189'
by_num[224]['correct_option'] = 'B'
by_num[224]['explanation'] = """17 : -153 :: -13 : ? :: -21 : 189
Logic: First Number × (-9) = Second Number
17 × (-9) = -153
-21 × (-9) = 189

Similarly,
-13 × (-9) = 117
Hence, correct option is (B)."""

# Q226: Clean up N * 7 - 3 logic
by_num[226]['question_text'] = 'Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 18 : 123 :: 15 : ? :: 19 : 130'
by_num[226]['correct_option'] = 'C'
by_num[226]['explanation'] = """18 : 123 :: 15 : ? :: 19 : 130
Logic: First Number × 7 - 3 = Second Number
18 × 7 - 3 = 126 - 3 = 123
19 × 7 - 3 = 133 - 3 = 130

Similarly,
15 × 7 - 3 = 105 - 3 = 102
Hence, correct option is (C)."""

# Q238: Clean up (N + 5) / 5
by_num[238]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 110 : 23 :: 85 : ?'
by_num[238]['correct_option'] = 'C'
by_num[238]['explanation'] = """110 : 23 :: 85 : ?
Logic: (First Number + 5) ÷ 5 = Second Number
(110 + 5) ÷ 5 = 115 ÷ 5 = 23

Similarly,
(85 + 5) ÷ 5 = 90 ÷ 5 = 18
Hence, correct option is (C)."""

# Q252: Clean up +111
by_num[252]['question_text'] = '287 is related to 398 following a certain logic. Following the same logic, 378 is related to 489. To which of the following is 852 related to, following the same logic?'
by_num[252]['correct_option'] = 'B'
by_num[252]['explanation'] = """287 : 398 :: 378 : 489 :: 852 : ?
Logic: Each digit is incremented by 1 (+111) to get the next number:
287 + 111 = 398
378 + 111 = 489

Similarly,
852 + 111 = 963
Hence, correct option is (B)."""

# Q253: Clean up +11
by_num[253]['question_text'] = '38 is related to 49 following a certain logic. Following the same logic, 64 is related to 75. To which of the following is 83 related to, following the same logic?'
by_num[253]['correct_option'] = 'D'
by_num[253]['explanation'] = """38 : 49 :: 64 : 75 :: 83 : ?
Logic: First Number + 11 = Second Number
38 + 11 = 49
64 + 11 = 75

Similarly,
83 + 11 = 94
Hence, correct option is (D)."""

# Q277: Clean up 3/4 ratio
by_num[277]['question_text'] = '72 is related to 96 following a certain logic. Following the same logic, 66 is related to 88. Which of the following numbers is related to 104 using the same logic?'
by_num[277]['correct_option'] = 'C'
by_num[277]['explanation'] = """72 : 96 :: 66 : 88 :: ? : 104
Logic: First Number : Second Number is in ratio 3 : 4
72 : 96 = 3 : 4 (Divided by 24)
66 : 88 = 3 : 4 (Divided by 22)

Similarly,
? : 104 = 3 : 4 => ? = 104 × (3/4) = 78
Hence, correct option is (C)."""

# Q280: 12^3 = 1728 (Option B)
by_num[280]['question_text'] = '4 is related to 64 following a certain logic. Following the same logic, 9 is related to 729. To which of the following is 12 related following the same logic?'
by_num[280]['correct_option'] = 'B'
by_num[280]['explanation'] = """4 : 64 :: 9 : 729 :: 12 : ?
Logic: First Number³ = Second Number
4³ = 64
9³ = 729

Similarly,
12³ = 1728
Hence, correct option is (B)."""

# Q282: 61 * 11 = 671 (Option B)
by_num[282]['question_text'] = '19 is related to 209 following a certain logic. Following the same logic, 27 is related to 297. To which of the following is 61 related, following the same logic?'
by_num[282]['correct_option'] = 'B'
by_num[282]['explanation'] = """19 : 209 :: 27 : 297 :: 61 : ?
Logic: First Number × 11 = Second Number
19 × 11 = 209
27 × 11 = 297

Similarly,
61 × 11 = 671
Hence, correct option is (B)."""

# Q283: +121 -> 187 (Option D)
by_num[283]['question_text'] = '31 is related to 152 by certain logic. Following the same logic, 47 is related to 168. To which of the following is 66 related, following the same logic?'
by_num[283]['correct_option'] = 'D'
by_num[283]['explanation'] = """31 : 152 :: 47 : 168 :: 66 : ?
Logic: Difference between numbers is constant (+121):
152 - 31 = 121
168 - 47 = 121

Similarly,
66 + 121 = 187
Hence, correct option is (D)."""

# ==========================================
# 3. TYPO FIXES IN SPECIFIC OPTIONS
# ==========================================
by_num[59]['option_d'] = '16 : 218'
by_num[67]['option_a'] = '1339'
by_num[67]['question_text'] = 'Select the option that is related to the third number in the same way as the second number is related to the first number. 18 : 323 :: 38 : ?'
by_num[121]['option_c'] = '123'
by_num[200]['option_c'] = '18 : 611'
by_num[306]['option_b'] = '486 : 468'

# ==========================================
# 4. SYSTEMATIC PROMPT PREFIX CLEANUP
# ==========================================
for q in data:
    qt = q['question_text'].strip()
    
    # Clean leading lowercase / truncated phrases
    if qt.startswith('the two numbers are related in the same way') or qt.startswith('the two numbers arerelated in the same way') or qt.startswith('thetwo numbers are related in the same way') or qt.startswith('thetwo numbers arerelated in the same way'):
        q['question_text'] = 'Select the number-pair in which ' + qt
    elif qt.startswith('the two numbers share the same') or qt.startswith('the twonumbers sharethesame') or qt.startswith('the two numbers sharethe same'):
        q['question_text'] = 'Select the option in which ' + qt
    elif qt.startswith('numbers share the same') or qt.startswith('numberssharethe same'):
        q['question_text'] = 'Select the option in which the ' + qt
    elif qt.startswith('to the third') or qt.startswith('tothethird') or qt.startswith('to thethird'):
        q['question_text'] = 'Select the option that is related ' + qt
    elif qt.startswith('to the fourth') or qt.startswith('tothefourth'):
        q['question_text'] = 'Select the option that is related ' + qt
    elif qt.startswith('to the fifth') or qt.startswith('tothefifth') or qt.startswith('to thefifth'):
        q['question_text'] = 'Select the option that is related ' + qt
    elif qt.startswith('to the sixth') or qt.startswith('tothesixth') or qt.startswith('to thesixth'):
        q['question_text'] = 'Select the option that is related ' + qt
    elif qt.startswith('to the fth') or qt.startswith('tothefth') or qt.startswith('to theffth'):
        q['question_text'] = 'Select the option that is related ' + qt
    elif qt.startswith('to each other in'):
        q['question_text'] = 'Select the option in which the numbers are related ' + qt
    elif qt.startswith('given options that is analogous'):
        q['question_text'] = 'Select the option from the ' + qt
    elif qt.startswith('bers are related to each other'):
        q['question_text'] = 'Select the option in which the num' + qt
    elif qt.startswith('bers arerelated in the same way'):
        q['question_text'] = 'Select the option in which the num' + qt
    elif qt.startswith('number-pair shares the same'):
        q['question_text'] = 'Select the option in which the ' + qt
    elif qt.startswith('Sclect '):
        q['question_text'] = 'Select ' + qt[7:]

# Save repaired JSON
with open('kiran_type2_307_verified.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Batch 2 final master repairs applied successfully!")
