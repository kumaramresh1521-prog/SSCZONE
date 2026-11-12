import json
import urllib.request
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

# Comprehensive dictionary of the 13 fixes
fixes = {
    10: {
        'question_text': '48 : 196 :: 52 : ?',
        'correct_option': 'C',
        'explanation': '48 : 196 :: 52 : ? \nLogic: 48 × 4 + 4 = 192 + 4 = 196. Similarly, 52 × 4 + 4 = 208 + 4 = 212. Hence, Option (C) is 212.'
    },
    13: {
        'question_text': '697 : 976 :: 532 : ?',
        'correct_option': 'D',
        'explanation': '697 : 976 :: 532 : ? \nLogic: The first digit is shifted to the last position (cyclic shift): 697 -> 976. Similarly, in 532, moving 5 to the last position yields 325. Hence, Option (D) is 325.'
    },
    21: {
        'question_text': '354 : 351 :: 478 : ?',
        'correct_option': 'C',
        'explanation': '354 : 351 :: 478 : ? \nLogic: 354 - 3 = 351 (subtract 3). Similarly, 478 - 3 = 475. Hence, Option (C) is 475.'
    },
    42: {
        'question_text': 'Select the option that is related to the third number in the same way as the second number is related to the first number.\n17 : 102 :: 23 : ?',
        'correct_option': 'C',
        'explanation': '17 : 102 :: 23 : ? \nLogic: 17 × 6 = 102 (multiply by 6). Similarly, 23 × 6 = 138. Hence, Option (C) is 138.'
    },
    106: {
        'question_text': 'Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number.\n11 : 81 :: ? : 121 :: 8 : 36',
        'correct_option': 'B',
        'explanation': '11 : 81 :: ? : 121 :: 8 : 36 \nLogic: (First number - 2)² = Second number.\n(11 - 2)² = 9² = 81;\n(8 - 2)² = 6² = 36.\nSimilarly, (? - 2)² = 121 = 11² => ? - 2 = 11 => ? = 13. Hence, Option (B) is 13.'
    },
    140: {
        'question_text': 'Select the option that is related to the sixth number in the same way as the first number is related to the second number and the third number is related to the fourth number.\n16 : 576 :: 8 : 80 :: 22 : ?',
        'correct_option': 'B',
        'explanation': '16 : 576 :: 8 : 80 :: 22 : ? \nLogic: Let the first number be 2n. Then the second number is n² × (n + 1).\nFor 16: 16/2 = 8 => 8² × (8 + 1) = 64 × 9 = 576.\nFor 8: 8/2 = 4 => 4² × (4 + 1) = 16 × 5 = 80.\nSimilarly, for 22: 22/2 = 11 => 11² × (11 + 1) = 121 × 12 = 1452. Hence, Option (B) is 1452.'
    },
    142: {
        'question_text': 'Select the option that is related to the fifth number in the same way as the second number is related to the first number and the fourth number is related to the third number.\n13 : 120 :: 17 : 152 :: 21 : ?',
        'correct_option': 'B',
        'explanation': '13 : 120 :: 17 : 152 :: 21 : ? \nLogic: Linear relation: Output = 8 × Input + 16 (or constant difference +32 for every +4 in input).\n8 × 13 + 16 = 104 + 16 = 120;\n8 × 17 + 16 = 136 + 16 = 152.\nSimilarly, 8 × 21 + 16 = 168 + 16 = 184. Hence, Option (B) is 184.'
    },
    176: {
        'question_text': 'Select the option that is related to the third number in the same way as the second number is related to the first number.\n28 : 98 :: 36 : ?',
        'correct_option': 'B',
        'explanation': '28 : 98 :: 36 : ? \nLogic: (First number)² ÷ 8 = Second number.\n28² ÷ 8 = 784 ÷ 8 = 98.\nSimilarly, 36² ÷ 8 = 1296 ÷ 8 = 162. Hence, Option (B) is 162.'
    },
    188: {
        'question_text': 'Select the number-pair in which the two numbers are related in the same way as are the two numbers of the following number-pair.\n14 : 450',
        'correct_option': 'D',
        'explanation': '14 : 450 \nLogic: (First number + 1)² × 2 = Second number.\n(14 + 1)² × 2 = 15² × 2 = 225 × 2 = 450.\nSimilarly, in Option (D):\n(18 + 1)² × 2 = 19² × 2 = 361 × 2 = 722. Hence, Option (D) is 18 : 722.'
    },
    196: {
        'question_text': 'Select the option that is related to the third number in the same way as the second number is related to the first number and the sixth number is related to the fifth number.\n5 : 27 :: 7 : ? :: 8 : 39',
        'correct_option': 'D',
        'explanation': '5 : 27 :: 7 : ? :: 8 : 39 \nLogic: First number × 4 + 7 = Second number.\n5 × 4 + 7 = 20 + 7 = 27;\n8 × 4 + 7 = 32 + 7 = 39.\nSimilarly, 7 × 4 + 7 = 28 + 7 = 35. Hence, Option (D) is 35.'
    },
    276: {
        'question_text': '5 is related to 27 by certain logic. Following the same logic, 7 is related to 51. To which of the following is 4 related, following the same logic?',
        'correct_option': 'C',
        'explanation': '5 : 27 :: 7 : 51 :: 4 : ? \nLogic: n² + 2 = Second number.\n5² + 2 = 25 + 2 = 27;\n7² + 2 = 49 + 2 = 51.\nSimilarly, 4² + 2 = 16 + 2 = 18. Hence, Option (C) is 18.\n(Note: The answer key in some book editions erroneously printed (4), but mathematically 4² + 2 = 18 is the indisputable correct answer).'
    },
    288: {
        'question_text': '16 is related to 112 following a certain logic. Following the same logic, 26 is related to 182. To which of the following is 44 related, following the same logic?',
        'correct_option': 'A',
        'explanation': '16 : 112 :: 26 : 182 :: 44 : ? \nLogic: First number × 7 = Second number.\n16 × 7 = 112;\n26 × 7 = 182.\nSimilarly, 44 × 7 = 308. Hence, Option (A) is 308.'
    },
    289: {
        'question_text': '8 is related to 512 following a certain logic. Following the same logic, 12 is related to 1728. To which of the following is 15 related, following the same logic?',
        'correct_option': 'C',
        'explanation': '8 : 512 :: 12 : 1728 :: 15 : ? \nLogic: First number cubed (n³) = Second number.\n8³ = 512;\n12³ = 1728.\nSimilarly, 15³ = 3375. Hence, Option (C) is 3375.'
    }
}

# 1. Apply fixes to JSON
for q_num, data in fixes.items():
    idx = q_num - 1
    for k, v in data.items():
        qs[idx][k] = v

with open('kiran_type2_307_verified.json', 'w', encoding='utf-8') as f:
    json.dump(qs, f, ensure_ascii=False, indent=2)

print(f"Applied all {len(fixes)} target fixes to kiran_type2_307_verified.json.")

# 2. Regenerate text files
lines = []
lines.append("================================================================================")
lines.append("SSC REASONING CHAPTERWISE (KIRAN PYQ) - 100% VERIFIED QUESTION BANK")
lines.append("CHAPTER : ANALOGY OR SIMILARITY (सादृश्यता या समानता)")
lines.append("BATCH 2 : TYPE-II (NUMBER ANALOGY - 307 QUESTIONS)")
lines.append("ALL QUESTIONS VERIFIED WITH STEP-BY-STEP MATHEMATICAL SOLUTIONS & EXAM TAGS")
lines.append("================================================================================\n")

for it in qs:
    q_num = it['question_number']
    exam = it['exam_tag'].strip('() ')
    exam_str = f" [Exam: {exam}]" if exam else ""
    
    lines.append("================================================================================")
    lines.append(f"QUESTION {q_num}{exam_str}")
    lines.append("Type: Type-II (Number Analogy) | Difficulty: Medium")
    lines.append("--------------------------------------------------------------------------------")
    lines.append(it['question_text'].strip())
    lines.append("")
    lines.append(f"(A) {it['option_a'].strip()}")
    lines.append(f"(B) {it['option_b'].strip()}")
    lines.append(f"(C) {it['option_c'].strip()}")
    lines.append(f"(D) {it['option_d'].strip()}")
    lines.append("")
    lines.append(f"Correct Answer : ({it['correct_option']})")
    
    expl = it['explanation'].strip()
    expl_lines = expl.split('\n')
    if len(expl_lines) == 1:
        lines.append(f"Explanation    : {expl}")
    else:
        lines.append("Explanation    :")
        for el in expl_lines:
            lines.append(f"  {el}")
    lines.append("================================================================================\n")

txt_content = '\n'.join(lines)

for p in ['batch2_type2_number_analogy_verified.txt', os.path.join('public', 'batch2_type2_number_analogy_verified.txt')]:
    with open(p, 'w', encoding='utf-8') as f:
        f.write(txt_content)
    print(f"Updated text file at {p}")

# 3. Deploy updated questions to Supabase Topics 224 and 242
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

for target_topic_id in [224, 242]:
    print(f"\n--- Re-syncing Type-II in Topic {target_topic_id} ---")
    
    del_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&tier_level=eq.Type-II",
        headers=headers,
        method='DELETE'
    )
    with urllib.request.urlopen(del_req) as resp:
        print(f"Deleted old Type-II in Topic {target_topic_id}")
        
    rows_to_insert = []
    for q in qs:
        rows_to_insert.append({
            'topic_id': target_topic_id,
            'question_text': q['question_text'],
            'option_a': q['option_a'],
            'option_b': q['option_b'],
            'option_c': q['option_c'],
            'option_d': q['option_d'],
            'correct_answer': q['correct_option'],
            'explanation': q['explanation'],
            'exam_tag': q['exam_tag'],
            'difficulty': 'medium',
            'is_active': True,
            'tier_level': 'Type-II'
        })
        
    chunk_size = 50
    inserted = 0
    for i in range(0, len(rows_to_insert), chunk_size):
        chunk = rows_to_insert[i:i + chunk_size]
        data_bytes = json.dumps(chunk, ensure_ascii=False).encode('utf-8')
        
        insert_req = urllib.request.Request(
            f"{url}/rest/v1/questions",
            data=data_bytes,
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(insert_req) as resp:
            inserted += len(chunk)
            
    print(f"Successfully re-inserted all {inserted} verified Type-II questions into Topic {target_topic_id}!")
    
    count_req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{target_topic_id}&select=id&limit=1",
        headers={**headers, 'Range-Unit': 'items', 'Prefer': 'count=exact'}
    )
    with urllib.request.urlopen(count_req) as resp:
        print(f"Total questions in Topic {target_topic_id}: {resp.headers.get('Content-Range')}")

print("\nALL 13 TARGET FIXES APPLIED, RE-DEPLOYED TO SUPABASE & TXT FILES REGENERATED!")
