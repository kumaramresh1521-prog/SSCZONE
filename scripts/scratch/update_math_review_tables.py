import sys, json, re
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request

u, k = get_supabase_credentials()

with open(r"c:\ssczone\scripts\scratch\gk_image_ocr_dump.json", encoding="utf-8") as f:
    items = json.load(f)

def clean_tok(s):
    s = s.strip()
    s = re.sub(r'^([a-dA-D1-5ivx]+[\.\)])([A-Za-z])', r'\1 \2', s)
    s = re.sub(r'([a-z])([A-Z])', r'\1 \2', s)
    # Fix glued words
    replacements = [
        ("declineinthemarketrateofexchange", "decline in the market rate of exchange"),
        ("contractionofhomecurrency", "contraction of home currency"),
        ("foreignexchangerationing", "foreign exchange rationing"),
        ("contractionofimports", "contraction of imports"),
        ("reduction in external value of thecurrency", "reduction in external value of the currency"),
        ("AsiaticSocietyofBengal", "Asiatic Society of Bengal"),
        ("SanskritCollegeofBenaras", "Sanskrit College of Benaras"),
        ("Fort William College", "Fort William College"),
        ("CalcuttaMadrasa", "Calcutta Madrasa"),
        ("GlobalSystemofTradePreferences", "Global System of Trade Preferences"),
        ("KasturbaGandhi Balika Vidyalaya Scheme", "Kasturba Gandhi Balika Vidyalaya Scheme"),
        ("Socialreformorgani", "Social reform organisations"),
        ("Alzheimer'sdiseases", "Alzheimer's disease"),
        ("AffectedOrgans", "Affected Organs"),
        ("Name of Disease", "Name of Disease"),
        ("Electriccurrent", "Electric current"),
        ("Physical Property", "Physical Property"),
        ("ModernPeriodicTable", "Modern Periodic Table"),
        ("RoleinDNAreplication", "Role in DNA replication"),
        ("Commonname", "Common name"),
        ("Blue-greenalgae", "Blue-green algae"),
        ("Brownalgae", "Brown algae"),
        ("OrganismResponsible", "Organism Responsible"),
    ]
    for old, new in replacements:
        s = s.replace(old, new)
    return s

count = 0
for it in items:
    lines = it['ocr_text']
    if not lines or len(lines) < 3:
        continue

    prompt = it['txt_prompt'].strip()
    start_idx = 0
    if not prompt and any(lines[0].lower().startswith(x) for x in ["match", "which", "the sex", "m is", "choose"]):
        prompt = lines[0]
        start_idx = 1

    remaining = lines[start_idx:]
    if len(remaining) < 2:
        continue

    h1 = clean_tok(remaining[0])
    h2 = clean_tok(remaining[1])
    data_lines = remaining[2:]

    # Separate items into Column A and Column B
    col_a = []
    col_b = []
    for line in data_lines:
        tok = clean_tok(line)
        # Check if starts with a., b., c., d. or A., B., C., D.
        if re.match(r'^[a-dA-D][\.\)]', tok):
            col_a.append(tok)
        elif re.match(r'^(?:[1-5]|i{1,3}|iv|v)[\.\)]', tok, re.IGNORECASE):
            col_b.append(tok)
        else:
            # fallback: if col_a has fewer items, put in col_a, else col_b
            if len(col_a) <= len(col_b):
                col_a.append(tok)
            else:
                col_b.append(tok)

    max_len = max(len(col_a), len(col_b))
    if max_len == 0:
        continue

    md_table = f"| {h1} | {h2} |\n| :--- | :--- |\n"
    for i in range(max_len):
        ca = col_a[i] if i < len(col_a) else ""
        cb = col_b[i] if i < len(col_b) else ""
        md_table += f"| {ca} | {cb} |\n"

    final_content = (prompt + "\n\n" + md_table).strip() if prompt else md_table.strip()

    # Update in Supabase math_review table
    req = urllib.request.Request(
        f"{u}/rest/v1/math_review?question_id=eq.{it['id']}",
        data=json.dumps({"suggested_latex": final_content}).encode(),
        headers={
            "apikey": k,
            "Authorization": f"Bearer {k}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        method="PATCH"
    )
    try:
        with urllib.request.urlopen(req) as res:
            count += 1
    except Exception as e:
        print(f"Error Q#{it['id']}: {e}")

print(f"✅ Successfully updated {count} table matching questions in math_review table with 2-column Markdown tables!")
