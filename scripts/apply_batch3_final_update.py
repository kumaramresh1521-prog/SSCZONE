import json

with open('kiran_type3_257_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

# 1. Q6
by_num[6]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following set. (9, 35, 16)'
by_num[6]['option_a'] = '(16, 50, 64)'
by_num[6]['option_b'] = '(25, 30, 4)'
by_num[6]['option_c'] = '(36, 55, 25)'
by_num[6]['option_d'] = '(81, 65, 36)'
by_num[6]['correct_option'] = 'C'
by_num[6]['explanation'] = """Given set: (9, 35, 16)
√9 = 3; √16 = 4
First and third numbers are perfect squares.
Logic: (Third number - First number) × 5 = Middle Number
(16 - 9) × 5 = 7 × 5 = 35

Similarly,
In Option (C): (36, 55, 25)
√36 = 6; √25 = 5
(36 - 25) × 5 = 11 × 5 = 55
Hence, correct option is (C)."""

# 2. Q10
by_num[10]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following set. (10, 18, 38)'
by_num[10]['option_a'] = '(4, 12, 22)'
by_num[10]['option_b'] = '(14, 12, 8)'
by_num[10]['option_c'] = '(12, 22, 46)'
by_num[10]['option_d'] = '(18, 6, 14)'
by_num[10]['correct_option'] = 'C'
by_num[10]['explanation'] = """Given set: (10, 18, 38)
Logic: First Number × 2 + Second Number = Third Number
10 × 2 + 18 = 20 + 18 = 38 (Third Number)

Similarly,
In Option (C): (12, 22, 46)
12 × 2 + 22 = 24 + 22 = 46 (Third Number)
Hence, correct option is (C)."""

# 3. Q24
by_num[24]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following set. (8, 101, 35)'
by_num[24]['option_a'] = '(11, 136, 47)'
by_num[24]['option_b'] = '(7, 89, 31)'
by_num[24]['option_c'] = '(9, 121, 39)'
by_num[24]['option_d'] = '(6, 76, 27)'
by_num[24]['correct_option'] = 'B'
by_num[24]['explanation'] = """Given set: (8, 101, 35)
Logic: (First Number × 4) + 3 = Third Number
And, (Third Number × 3) - 4 = Middle Number
(8 × 4) + 3 = 32 + 3 = 35
(35 × 3) - 4 = 105 - 4 = 101

Similarly,
In Option (B): (7, 89, 31)
(7 × 4) + 3 = 28 + 3 = 31
(31 × 3) - 4 = 93 - 4 = 89
Hence, correct option is (B)."""

# 4. Q63
by_num[63]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following set. (17, 24, 45)'
by_num[63]['option_a'] = '(19, 26, 34)'
by_num[63]['option_b'] = '(18, 23, 46)'
by_num[63]['option_c'] = '(15, 20, 43)'
by_num[63]['option_d'] = '(12, 19, 40)'
by_num[63]['correct_option'] = 'D'
by_num[63]['explanation'] = """Given set: (17, 24, 45)
Logic: First Number + 7 = Second Number
And, First Number + 28 = Third Number
17 + 7 = 24
17 + 28 = 45

Similarly,
In Option (D): (12, 19, 40)
12 + 7 = 19
12 + 28 = 40
Hence, correct option is (D)."""

# 5. Q69
by_num[69]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following set. (88, 60, 37)'
by_num[69]['option_a'] = '(36, 70, 38)'
by_num[69]['option_b'] = '(43, 49, 27)'
by_num[69]['option_c'] = '(56, 38, 28)'
by_num[69]['option_d'] = '(94, 42, 34)'
by_num[69]['correct_option'] = 'D'
by_num[69]['explanation'] = """Given set: (88, 60, 37)
Logic: First Number + Second Number = Third Number × 4
88 + 60 = 148
37 × 4 = 148

Similarly,
In Option (D): (94, 42, 34)
94 + 42 = 136
34 × 4 = 136
Hence, correct option is (D)."""

# 6. Q77
by_num[77]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following set. (8, 44, 224)'
by_num[77]['option_a'] = '(11, 59, 299)'
by_num[77]['option_b'] = '(9, 80, 312)'
by_num[77]['option_c'] = '(15, 75, 301)'
by_num[77]['option_d'] = '(7, 39, 190)'
by_num[77]['correct_option'] = 'A'
by_num[77]['explanation'] = """Given set: (8, 44, 224)
Logic: First Number × 5 + 4 = Second Number; Second Number × 5 + 4 = Third Number
8 × 5 + 4 = 40 + 4 = 44
44 × 5 + 4 = 220 + 4 = 224

Similarly,
In Option (A): (11, 59, 299)
11 × 5 + 4 = 55 + 4 = 59
59 × 5 + 4 = 295 + 4 = 299
Hence, correct option is (A)."""

# 7. Q91
by_num[91]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (37, 28, 333) (41, 39, 82)'
by_num[91]['option_a'] = '(18, 13, 90)'
by_num[91]['option_b'] = '(17, 14, 67)'
by_num[91]['option_c'] = '(16, 12, 54)'
by_num[91]['option_d'] = '(19, 15, 44)'
by_num[91]['correct_option'] = 'A'
by_num[91]['explanation'] = """Given sets: (37, 28, 333), (41, 39, 82)
Logic: First Number × (First Number - Second Number) = Third Number
37 × (37 - 28) = 37 × 9 = 333
41 × (41 - 39) = 41 × 2 = 82

Similarly,
In Option (A): (18, 13, 90)
18 × (18 - 13) = 18 × 5 = 90
Hence, correct option is (A)."""

# 8. Q96
by_num[96]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (25, 19, 14) (50, 28, 30)'
by_num[96]['option_a'] = '(41, 24, 36)'
by_num[96]['option_b'] = '(31, 20, 25)'
by_num[96]['option_c'] = '(24, 17, 21)'
by_num[96]['option_d'] = '(35, 22, 21)'
by_num[96]['correct_option'] = 'D'
by_num[96]['explanation'] = """Given sets: (25, 19, 14), (50, 28, 30)
Logic: First Number + 8 = Second Number + Third Number
25 + 8 = 33 and 19 + 14 = 33
50 + 8 = 58 and 28 + 30 = 58

Similarly,
In Option (D): (35, 22, 21)
35 + 8 = 43 and 22 + 21 = 43
Hence, correct option is (D)."""

# 9. Q98
by_num[98]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (45, 37, 360) (17, 14, 51)'
by_num[98]['option_a'] = '(18, 10, 148)'
by_num[98]['option_b'] = '(35, 22, 465)'
by_num[98]['option_c'] = '(21, 17, 87)'
by_num[98]['option_d'] = '(34, 26, 272)'
by_num[98]['correct_option'] = 'D'
by_num[98]['explanation'] = """Given sets: (45, 37, 360), (17, 14, 51)
Logic: First Number × (First Number - Second Number) = Third Number
45 × (45 - 37) = 45 × 8 = 360
17 × (17 - 14) = 17 × 3 = 51

Similarly,
In Option (D): (34, 26, 272)
34 × (34 - 26) = 34 × 8 = 272
Hence, correct option is (D)."""

# 10. Q107
by_num[107]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (11, 10, 21) (14, 6, 160)'
by_num[107]['option_a'] = '(16, 9, 165)'
by_num[107]['option_b'] = '(19, 12, 217)'
by_num[107]['option_c'] = '(81, 16, 65)'
by_num[107]['option_d'] = '(27, 18, 9)'
by_num[107]['correct_option'] = 'B'
by_num[107]['explanation'] = """Given sets: (11, 10, 21), (14, 6, 160)
Logic: (First Number + Second Number) × (First Number - Second Number) = First² - Second² = Third Number
(11 + 10) × (11 - 10) = 21 × 1 = 21 (or 11² - 10² = 121 - 100 = 21)
(14 + 6) × (14 - 6) = 20 × 8 = 160 (or 14² - 6² = 196 - 36 = 160)

Similarly,
In Option (B): (19, 12, 217)
(19 + 12) × (19 - 12) = 31 × 7 = 217 (or 19² - 12² = 361 - 144 = 217)
Hence, correct option is (B)."""

# 11. Q120
by_num[120]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (63, 81, 7) (84, 49, 12)'
by_num[120]['option_a'] = '(99, 121, 9)'
by_num[120]['option_b'] = '(76, 234, 12)'
by_num[120]['option_c'] = '(12, 125, 56)'
by_num[120]['option_d'] = '(78, 14, 56)'
by_num[120]['correct_option'] = 'A'
by_num[120]['explanation'] = """Given sets: (63, 81, 7), (84, 49, 12)
Logic: (First Number ÷ Third Number)² = Middle Number
(63 ÷ 7)² = 9² = 81
(84 ÷ 12)² = 7² = 49

Similarly,
In Option (A): (99, 121, 9)
(99 ÷ 9)² = 11² = 121
Hence, correct option is (A)."""

# 12. Q124
by_num[124]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (8, 540, 60) (9, 70, 7)'
by_num[124]['option_a'] = '(12, 56, 60)'
by_num[124]['option_b'] = '(8, 63, 7)'
by_num[124]['option_c'] = '(9, 54, 12)'
by_num[124]['option_d'] = '(9, 45, 7)'
by_num[124]['correct_option'] = 'B'
by_num[124]['explanation'] = """Given sets: (8, 540, 60), (9, 70, 7)
Logic: (First Number + 1) × Third Number = Middle Number
(8 + 1) × 60 = 9 × 60 = 540
(9 + 1) × 7 = 10 × 7 = 70

Similarly,
In Option (B): (8, 63, 7)
(8 + 1) × 7 = 9 × 7 = 63
Hence, correct option is (B)."""

# 13. Q170
by_num[170]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (36, 21, 35) (43, 19, 53)'
by_num[170]['option_a'] = '(51, 34, 39)'
by_num[170]['option_b'] = '(48, 37, 25)'
by_num[170]['option_c'] = '(44, 20, 54)'
by_num[170]['option_d'] = '(35, 22, 34)'
by_num[170]['correct_option'] = 'A'
by_num[170]['explanation'] = """Given sets: (36, 21, 35), (43, 19, 53)
Logic: (First Number - Second Number) × 2 + 5 = Third Number
(36 - 21) × 2 + 5 = 15 × 2 + 5 = 30 + 5 = 35
(43 - 19) × 2 + 5 = 24 × 2 + 5 = 48 + 5 = 53

Similarly,
In Option (A): (51, 34, 39)
(51 - 34) × 2 + 5 = 17 × 2 + 5 = 34 + 5 = 39
Hence, correct option is (A)."""

# 14. Q172
by_num[172]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (12, 4, 64) (8, 6, 14)'
by_num[172]['option_a'] = '(7, 3, 28)'
by_num[172]['option_b'] = '(10, 6, 42)'
by_num[172]['option_c'] = '(11, 9, 15)'
by_num[172]['option_d'] = '(9, 5, 28)'
by_num[172]['correct_option'] = 'D'
by_num[172]['explanation'] = """Given sets: (12, 4, 64), (8, 6, 14)
Logic: (First Number - Second Number) × (First Number + Second Number) ÷ 2 = (First² - Second²) ÷ 2 = Third Number
(12 - 4) × (12 + 4) ÷ 2 = 8 × 16 ÷ 2 = 64
(8 - 6) × (8 + 6) ÷ 2 = 2 × 14 ÷ 2 = 14

Similarly,
In Option (D): (9, 5, 28)
(9 - 5) × (9 + 5) ÷ 2 = 4 × 14 ÷ 2 = 28
Hence, correct option is (D)."""

# 15. Q184
by_num[184]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. 8 : 50 :: 4 : 30'
by_num[184]['option_a'] = '20 : 40'
by_num[184]['option_b'] = '6 : 20'
by_num[184]['option_c'] = '7 : 45'
by_num[184]['option_d'] = '5 : 8'
by_num[184]['correct_option'] = 'C'
by_num[184]['explanation'] = """Given pairs: 8 : 50 :: 4 : 30
Logic: First Number × 5 + 10 = Second Number
8 × 5 + 10 = 40 + 10 = 50
4 × 5 + 10 = 20 + 10 = 30

Similarly,
In Option (C): 7 : 45
7 × 5 + 10 = 35 + 10 = 45
Hence, correct option is (C)."""

# 16. Q199
by_num[199]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (30, 625, 5) (20, 225, 5)'
by_num[199]['option_a'] = '(19, 122, 7)'
by_num[199]['option_b'] = '(21, 297, 6)'
by_num[199]['option_c'] = '(32, 280, 5)'
by_num[199]['option_d'] = '(24, 256, 8)'
by_num[199]['correct_option'] = 'D'
by_num[199]['explanation'] = """Given sets: (30, 625, 5), (20, 225, 5)
Logic: (First Number - Third Number)² = Middle Number
(30 - 5)² = 25² = 625
(20 - 5)² = 15² = 225

Similarly,
In Option (D): (24, 256, 8)
(24 - 8)² = 16² = 256
Hence, correct option is (D)."""

# 17. Q205
by_num[205]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (12, 36, 6) (18, 54, 9)'
by_num[205]['option_a'] = '(28, 86, 14)'
by_num[205]['option_b'] = '(26, 84, 14)'
by_num[205]['option_c'] = '(28, 84, 16)'
by_num[205]['option_d'] = '(28, 84, 14)'
by_num[205]['correct_option'] = 'D'
by_num[205]['explanation'] = """Given sets: (12, 36, 6), (18, 54, 9)
Logic: First Number × 3 = Middle Number; First Number ÷ 2 = Third Number
12 × 3 = 36 and 12 ÷ 2 = 6
18 × 3 = 54 and 18 ÷ 2 = 9

Similarly,
In Option (D): (28, 84, 14)
28 × 3 = 84 and 28 ÷ 2 = 14
Hence, correct option is (D)."""

# 18. Q209
by_num[209]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. (4, 12, 48) (9, 27, 108)'
by_num[209]['option_a'] = '(13, 39, 156)'
by_num[209]['option_b'] = '(13, 36, 156)'
by_num[209]['option_c'] = '(13, 36, 146)'
by_num[209]['option_d'] = '(13, 39, 146)'
by_num[209]['correct_option'] = 'A'
by_num[209]['explanation'] = """Given sets: (4, 12, 48), (9, 27, 108)
Logic: First Number × 3 = Second Number; Second Number × 4 = Third Number
4 × 3 = 12 and 12 × 4 = 48
9 × 3 = 27 and 27 × 4 = 108

Similarly,
In Option (A): (13, 39, 156)
13 × 3 = 39 and 39 × 4 = 156
Hence, correct option is (A)."""

# 19. Q243
by_num[243]['question_text'] = 'Select the set in which the numbers are related in the same way as are the numbers of the following sets. 10 - 12 - 8 - 15 :: 12 - 14 - 10 - 19'
by_num[243]['option_a'] = '11 - 13 - 9 - 17'
by_num[243]['option_b'] = '8 - 6 - 10 - 18'
by_num[243]['option_c'] = '6 - 8 - 12 - 16'
by_num[243]['option_d'] = '15 - 13 - 9 - 19'
by_num[243]['correct_option'] = 'A'
by_num[243]['explanation'] = """Given sets: 10 - 12 - 8 - 15 :: 12 - 14 - 10 - 19
Logic: Pattern of operations across the four numbers is (+2, -4, ×2 - 1):
10 + 2 = 12; 12 - 4 = 8; (8 × 2) - 1 = 15
12 + 2 = 14; 14 - 4 = 10; (10 × 2) - 1 = 19

Similarly,
In Option (A): 11 - 13 - 9 - 17
11 + 2 = 13; 13 - 4 = 9; (9 × 2) - 1 = 17
Hence, correct option is (A)."""

# Save updated JSON
with open('kiran_type3_257_verified.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully applied updates to kiran_type3_257_verified.json!")
