import sys, os, re
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
import urllib.request, json
from supabase_env import get_supabase_credentials
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
url, key = get_supabase_credentials()
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Accept': 'application/json'}

req = urllib.request.Request(
    f"{url}/rest/v1/paper_questions?question_number=gte.26&question_number=lte.50&question_text=ilike.*images*&limit=50&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d,correct_answer",
    headers=headers
)
with urllib.request.urlopen(req) as res:
    rows = json.loads(res.read())

results = []
for r in rows:
    txt = r['question_text']
    m = re.search(r'!\[.*?\]\((/images/pyq/.*?)\)', txt)
    if not m:
        continue
    img_rel = m.group(1).lstrip('/')
    local_path = os.path.join(r"c:\ssczone\public", img_rel.replace('/', '\\'))
    
    ocr_lines = []
    if os.path.exists(local_path):
        ocr_res, _ = ocr(local_path)
        if ocr_res:
            ocr_lines = [line[1] for line in ocr_res]
    
    results.append({
        "id": r['id'],
        "paper_id": r['paper_id'],
        "q_num": r['question_number'],
        "img_path": img_rel,
        "exists": os.path.exists(local_path),
        "txt_prompt": re.sub(r'!\[.*?\]\(.*?\)', '', txt).strip(),
        "ocr_text": ocr_lines,
        "option_a": r['option_a'],
        "correct": r['correct_answer']
    })

print(f"Processed {len(results)} image questions in GK.")
with open(r"c:\ssczone\scripts\scratch\gk_image_ocr_dump.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Saved dump to c:\\ssczone\\scripts\\scratch\\gk_image_ocr_dump.json")
