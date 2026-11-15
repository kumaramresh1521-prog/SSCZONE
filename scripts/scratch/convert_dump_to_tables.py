import json, re

with open(r"c:\ssczone\scripts\scratch\gk_image_ocr_dump.json", encoding="utf-8") as f:
    items = json.load(f)

def clean_tok(s):
    # insert spaces between camelCase or joined words
    s = s.strip()
    # fix missing spaces e.g. a)Tajul -> a) Tajul
    s = re.sub(r'^([a-dA-D1-4ivx]+[\.\)])([A-Za-z])', r'\1 \2', s)
    s = re.sub(r'([a-z])([A-Z])', r'\1 \2', s)
    return s

converted = []
for it in items:
    lines = it['ocr_text']
    if not lines or len(lines) < 3:
        continue

    # Extract any prompt line if first line starts with 'Match' or 'Which'
    prompt = it['txt_prompt'].strip()
    start_idx = 0
    if not prompt and any(lines[0].lower().startswith(x) for x in ["match", "which", "the sex", "m is", "choose"]):
        prompt = lines[0]
        start_idx = 1

    remaining = lines[start_idx:]
    if len(remaining) < 2:
        continue

    # Check if first 2 are headers
    h1 = clean_tok(remaining[0])
    h2 = clean_tok(remaining[1])
    data_lines = remaining[2:]

    # Build pairs
    pairs = []
    i = 0
    while i < len(data_lines):
        left = clean_tok(data_lines[i])
        right = clean_tok(data_lines[i+1]) if i+1 < len(data_lines) else ""
        pairs.append((left, right))
        i += 2

    # Build markdown table
    md_table = f"| {h1} | {h2} |\n| :--- | :--- |\n"
    for l, r in pairs:
        md_table += f"| {l} | {r} |\n"

    final_content = (prompt + "\n\n" + md_table).strip() if prompt else md_table.strip()

    converted.append({
        "question_id": it["id"],
        "paper_id": it["paper_id"],
        "q_num": it["q_num"],
        "table_md": final_content
    })

print(f"Successfully converted {len(converted)} items to 2-column tables!\n")
for c in converted[:3]:
    print(f"=== Q#{c['question_id']} (Q.{c['q_num']}) ===")
    print(c['table_md'])
    print()
