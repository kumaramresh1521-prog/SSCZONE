import json
import sys
import os
import requests

sys.stdout.reconfigure(encoding='utf-8')

# Load Supabase credentials
env = {}
with open(r'c:\ssczone\.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

json_path = r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-12-october-2026-shift-3.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

paper_id = 50

comprehension_passage = (
    "**Comprehension (Q. 96 - 100):**\n\n"
    "The growing use of virtual reality (VR) in education reflects a shift in how knowledge is constructed and internalised. "
    "Unlike conventional media, immersive environments allow learners to engage directly with abstract concepts. "
    "Educational psychologists argue that such experiences help learners build mental models that are more readily (A)_______ "
    "into long-term memory than information gained through lectures or textbooks. However, immersion alone does not ensure "
    "intellectual progress. A visually impressive simulation may attract attention without promoting conceptual understanding. "
    "Thus, VR depends on technological sophistication and pedagogical frameworks that (B)_______ learners' cognitive limitations "
    "while encouraging analytical reflection. Realistic simulations may improve motivation, but excessive sensory information "
    "can overwhelm learners. Researchers therefore recommend structured pauses for reflection, (C)_______ students confuse "
    "vivid experiences with durable understanding. VR raises concerns about access. Wealthier institutions are more likely "
    "to adopt advanced technologies than those with limited budgets. (D)_______ technological capability continues to expand, "
    "disparities in educational access remain persistent. Ultimately, VR will fulfil its educational promise only through "
    "thoughtful design and equitable implementation. Otherwise, its initial appeal may gradually (E)_______, leaving impressive "
    "technology but limited educational transformation."
)

for q in data:
    qn = q['question_number']

    # --- Reasoning figures text ---
    if qn == 17:
        q['question_text'] = (
            "In the following question, a figure (X) is given, followed by four alternative figures (1), (2), (3), and (4) "
            "such that figure (X) is embedded in one of them. Trace out the alternative figure that contains fig. (X) as part of it.\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p3_x307.jpeg)"
        )
    elif qn == 19:
        q['question_text'] = (
            "In the following question, out of the five figures marked (a), (b), (c), (d), and (e), four are similar in a certain manner. "
            "However, one figure is not like the other four. Choose the figure which is different from the rest.\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p4_x548.jpeg)"
        )
    elif qn == 20:
        q['question_text'] = (
            "How many triangles are there in the given figure?\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p4_x549.jpeg)"
        )
    elif qn == 21:
        q['question_text'] = (
            "In the following question, there is a specific relationship between the first two figures. "
            "Establish a similar relationship between the third and fourth figures by selecting a suitable figure "
            "from the given Answer Figures to replace the question mark (?).\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p4_x550.jpeg)"
        )
    elif qn == 22:
        q['question_text'] = (
            "In the following question, there is a specific relationship between the first two figures. "
            "Establish a similar relationship between the third and fourth figures by selecting a suitable figure "
            "from the given Answer Figures to replace the question mark (?).\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p4_x551.jpeg)"
        )
    elif qn == 24:
        q['question_text'] = (
            "Carefully observe Figure (X) and identify the answer figure in which Figure (X) is embedded in the same or rotated form.\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p4_x552.jpeg)"
        )

    # --- GK Options ---
    elif qn == 31:
        q['option_a'] = 'Annual Budgetary Report'
        q['option_b'] = 'Annual Financial Statement'
        q['option_c'] = 'National Revenue Estimate'
        q['option_d'] = 'Yearly Expenditure Plan'
    elif qn == 37:
        q['option_a'] = 'Matki - Madhya Pradesh'
        q['option_b'] = 'Pandavani - Uttar Pradesh'
        q['option_c'] = 'Chhai Lam - Nagaland'
        q['option_d'] = 'Karakattam - Kerala'
    elif qn == 44:
        q['option_a'] = 'Lakshadweep - 29.09%'
        q['option_b'] = 'Delhi - 27.09%'
        q['option_c'] = 'Bihar - 31.12%'
        q['option_d'] = 'Kerala - 32.94%'

    # --- Data Interpretation & Math ---
    elif qn == 54:
        q['question_text'] = (
            "Examine the frequency polygon on math Exam Scores (out of 100), Groups: Batch A vs. Batch B and answer the following question.\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p7_x1311.jpeg)\n\n"
            "Which batch has a higher average (approximate) score, assuming midpoints represent class scores?"
        )
        q['option_a'] = 'Batch A'
        q['option_b'] = 'Batch B'
        q['option_c'] = 'Both have equal average'
        q['option_d'] = 'Cannot be determined'
    elif qn == 55:
        q['question_text'] = "If tanθ = 3/4, find the value of (1 + sinθ)(1 - sinθ)."
        q['option_a'] = '7/25'
        q['option_b'] = '9/25'
        q['option_c'] = '16/25'
        q['option_d'] = '1'
    elif qn == 56:
        q['question_text'] = (
            "Using the provided bar graph, which shows the quantity of fruit sold in kilograms, answer the following questions.\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p7_x1313.jpeg)\n\n"
            "If the fruits are ranked based on descending order of quantity sold, what is the ratio of the combined sales of the top two fruits to the bottom two?"
        )
    elif qn == 57:
        q['question_text'] = (
            "Examine the bar graph below to answer the following question.\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p8_x1598.jpeg)\n\n"
            "What is the average female literacy rate across the five listed states?"
        )
    elif qn == 58:
        q['question_text'] = (
            "Carefully study the pie chart showing the distribution of favorite colors. Then answer the following questions.\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p8_x1599.jpeg)\n\n"
            "Assume the total number of respondents shown in the chart is 1,000. If 10% of people who preferred Red switch to Yellow, and 20% of people who preferred Other switch to Blue, what will be the new percentage of people who prefer Blue?"
        )
    elif qn == 59:
        q['question_text'] = "Evaluate: (0.125 − 0.027) / (0.25 + 0.15 + 0.09)"
    elif qn == 60:
        q['question_text'] = "Find the value of ((0.013)³ − (0.011)³) / ((0.013)² + 0.000143 + (0.011)²)"
    elif qn == 61:
        q['question_text'] = "If 2x = 0.5y, then find (y² − x²) / (y² + 2xy + x²)."
        q['option_a'] = '2/5'
        q['option_b'] = '4/5'
        q['option_c'] = '3/5'
        q['option_d'] = '7/5'
    elif qn == 62:
        q['question_text'] = "Find the value of (x + y) if 5x2y1 is divisible by 3 and x and y are the same digit."
        q['option_a'] = '4'
        q['option_b'] = '8'
        q['option_c'] = '36'
        q['option_d'] = '34'
    elif qn == 72:
        q['question_text'] = (
            "Read the given histogram carefully which shows the number of cars observed at different time intervals of the day (in hours) and answer the question that follows:\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p9_x1900.jpeg)\n\n"
            "Find the time interval during which more than 20% of total cars passed."
        )
    elif qn == 74:
        q['question_text'] = (
            "The following pie-chart illustrates the percentage distribution of study time allocated to various subjects and activities. Study the pie-chart thoroughly and solve the questions based on the conditions provided.\n\n"
            "![Figure](/images/pyq/2026/ssc-cgl-2026-12-october-2026-shift-3_p9_x1901.jpeg)\n\n"
            "Suppose a student's total study time is 40 hours per week. The student decides to increase the efficiency of 'Mathematics' by 20% (meaning they achieve the same learning output in 20% less time) and reallocates the \"saved\" time equally between 'Reasoning' and 'Revision'. What is the new absolute time (in minutes) spent on 'Reasoning'?"
        )

    # --- English Enhancements ---
    elif qn == 79:
        q['question_text'] = (
            "Rearrange the parts of the sentence in the correct order.\n\n"
            "The recent diplomatic summit\n"
            "P. and fostering regional cooperation\n"
            "Q. witnessed discussions on security concerns\n"
            "R. while addressing climate change policies,\n"
            "S. aimed at strengthening bilateral trade"
        )
    elif qn == 84:
        q['question_text'] = "Which of the following options is TRUE about the underlined word? The debate on climate change is moot since the policy has already been enacted."
    elif qn == 88:
        q['option_d'] = 'Prophane'
    elif qn == 96:
        q['question_text'] = (
            f"{comprehension_passage}\n\n---\n\n"
            "Which word most appropriately fills blank (A) to convey the process by which newly acquired knowledge becomes deeply integrated into a learner's long-term cognitive framework?"
        )
    elif qn == 97:
        q['question_text'] = (
            f"{comprehension_passage}\n\n---\n\n"
            "Which verb best fills blank (B), reflecting the idea that effective instructional design must take learners' mental capacities into careful consideration rather than ignore them?"
        )
    elif qn == 98:
        q['question_text'] = (
            f"{comprehension_passage}\n\n---\n\n"
            "Which conjunction most effectively fills blank (C) to express the preventive purpose behind providing opportunities for reflective thinking after immersive experiences?"
        )
    elif qn == 99:
        q['question_text'] = (
            f"{comprehension_passage}\n\n---\n\n"
            "Which connector best fills blank (D) to highlight the contrast between rapid technological advancement and the continued persistence of unequal educational opportunities?"
        )
    elif qn == 100:
        q['question_text'] = (
            f"{comprehension_passage}\n\n---\n\n"
            "Which verb most accurately fills blank (E) to describe the gradual decline of public enthusiasm if educational innovation fails to produce meaningful outcomes?"
        )

print("Applied all fixes to data in memory.")

# 1. Save local JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"Saved: {json_path}")

# 2. Save F: drive JSON
f_json_path = r'F:\startup  send mail\2026\ssc-cgl-2026-12-october-2026-shift-3.json'
with open(f_json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"Saved: {f_json_path}")

# 3. Generate TXT format
txt_lines = []
for q in sorted(data, key=lambda x: x['question_number']):
    txt_lines.append(f"Q.{q['question_number']}: {q['question_text']}")
    txt_lines.append(f"A: {q['option_a']}")
    txt_lines.append(f"B: {q['option_b']}")
    txt_lines.append(f"C: {q['option_c']}")
    txt_lines.append(f"D: {q['option_d']}")
    txt_lines.append(f"ANS: {q['correct_answer']}")
    txt_lines.append("")

txt_content = "\n".join(txt_lines)

# 4. Save local TXT
local_txt_path = r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-12-october-2026-shift-3.txt'
with open(local_txt_path, 'w', encoding='utf-8') as f:
    f.write(txt_content)
print(f"Saved: {local_txt_path}")

# 5. Save F: drive TXT
f_txt_path = r'F:\startup  send mail\2026\ssc-cgl-2026-12-october-2026-shift-3.txt'
with open(f_txt_path, 'w', encoding='utf-8') as f:
    f.write(txt_content)
print(f"Saved: {f_txt_path}")

# 6. Sync to Supabase `paper_questions`
print("\nSyncing to Supabase `paper_questions`...")
del_resp = requests.delete(
    f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}',
    headers=HEADERS
)
print(f"DELETE status: {del_resp.status_code}")

chunk_size = 50
total_inserted = 0
for i in range(0, len(data), chunk_size):
    chunk = data[i:i+chunk_size]
    rows = []
    for q in chunk:
        row = {
            'paper_id': paper_id,
            'question_number': q['question_number'],
            'question_text': q['question_text'],
            'option_a': q['option_a'],
            'option_b': q['option_b'],
            'option_c': q['option_c'],
            'option_d': q['option_d'],
            'correct_answer': q['correct_answer'],
        }
        if 'explanation' in q:
            row['explanation'] = q.get('explanation', '')
        if 'subject' in q:
            row['subject'] = q.get('subject', '')
        rows.append(row)

    ins_resp = requests.post(
        f'{SUPABASE_URL}/rest/v1/paper_questions',
        headers=HEADERS,
        json=rows
    )
    if ins_resp.status_code in [200, 201]:
        total_inserted += len(rows)
        print(f"  Inserted chunk {i//chunk_size + 1}: {len(rows)} rows OK")
    else:
        print(f"  ERROR inserting chunk {i//chunk_size + 1}: {ins_resp.status_code} {ins_resp.text}")

print(f"\nTotal synced to Supabase: {total_inserted}/100 rows.")
