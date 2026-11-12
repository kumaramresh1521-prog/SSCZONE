import json

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed = {q['q_num']: q for q in json.load(f)}

with open('scripts/pdf_samples/t4_explanations_all.json', 'r', encoding='utf-8') as f:
    expls = json.load(f)

print("expls type:", type(expls), "len:", len(expls))
if isinstance(expls, dict):
    sample_keys = list(expls.keys())[:5]
    print("sample keys:", sample_keys, "sample val:", repr(expls[sample_keys[0]])[:150])

check_qs = [29, 61, 68, 70, 76, 78, 82, 87, 92, 96, 97, 100, 103, 104, 106, 110, 111, 113, 118, 120,
            121, 128, 130, 132, 133, 139, 142, 143, 144, 145, 146, 149, 150, 153, 155, 156, 158, 159,
            165, 166, 167, 172, 176, 180, 181, 188, 195, 196, 200, 201, 202, 204, 206, 220, 230, 237, 238, 249, 251, 252]

for qn in check_qs:
    e = expls.get(str(qn), expls.get(qn, ''))
    raw = parsed[qn].get('raw_lines', [])
    print(f"Q{qn:3d} | EXP: {repr(e)[:180]}")
    if qn in [103, 121, 133, 145, 149, 153, 195, 204, 220, 76, 96]:
        print(f"       RAW: {raw}")
