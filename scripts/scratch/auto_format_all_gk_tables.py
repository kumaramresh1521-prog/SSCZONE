import sys, os, re, json
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
from rapidocr_onnxruntime import RapidOCR
import urllib.request

ocr = RapidOCR()
u, k = get_supabase_credentials()

dump_path = r"c:\ssczone\scripts\scratch\gk_image_ocr_dump.json"
with open(dump_path, encoding="utf-8") as f:
    items = json.load(f)

def clean_spacing(text):
    """Add spaces between words if OCR glued them together."""
    # Common glued patterns in these tables
    replacements = [
        ("declineinthemarketrateofexchange", "decline in the market rate of exchange"),
        ("contractionofhomecurrency", "contraction of home currency"),
        ("foreignexchangerationing", "foreign exchange rationing"),
        ("contractionofimports", "contraction of imports"),
        ("reduction in external value of thecurrency", "reduction in external value of the currency"),
        ("AsiaticSocietyofBengal", "Asiatic Society of Bengal"),
        ("SanskritCollegeofBenaras", "Sanskrit College of Benaras"),
        ("Fort William College", "Fort William College"),
        ("GlobalSystemofTradePreferences", "Global System of Trade Preferences"),
        ("KasturbaGandhi Balika Vidyalaya Scheme", "Kasturba Gandhi Balika Vidyalaya Scheme"),
        ("Socialreformorgani", "Social reform organisations"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text

def build_2col_table(boxes_result):
    """Split boxes into Left and Right columns by X-midpoint, then sort by Y."""
    if not boxes_result:
        return ""

    # Calculate average X to find column split boundary
    all_x = [(box[0][0] + box[1][0]) / 2 for box, _, _ in boxes_result]
    min_x, max_x = min(all_x), max(all_x)
    split_x = (min_x + max_x) / 2

    # Separate into left and right
    left_items = []
    right_items = []

    for box, text, score in boxes_result:
        x_mid = (box[0][0] + box[1][0]) / 2
        y_mid = (box[0][1] + box[2][1]) / 2
        text = clean_spacing(text.strip())
        if x_mid < split_x:
            left_items.append((y_mid, text))
        else:
            right_items.append((y_mid, text))

    left_items.sort(key=lambda x: x[0])
    right_items.sort(key=lambda x: x[0])

    # Check if first items are headers
    header_left = "Column A"
    header_right = "Column B"

    if left_items and any(h in left_items[0][1].lower() for h in ["column", "list", "book", "state", "concept", "institute", "country", "name"]):
        header_left = left_items[0][1]
        left_items = left_items[1:]

    if right_items and any(h in right_items[0][1].lower() for h in ["column", "list", "author", "capital", "description", "founder", "language", "characteristic", "unit"]):
        header_right = right_items[0][1]
        right_items = right_items[1:]

    # Match rows: max len of left and right
    max_len = max(len(left_items), len(right_items))
    if max_len == 0:
        return ""

    table_lines = [
        f"| {header_left} | {header_right} |",
        "| :--- | :--- |"
    ]

    for i in range(max_len):
        l_text = left_items[i][1] if i < len(left_items) else ""
        r_text = right_items[i][1] if i < len(right_items) else ""
        table_lines.append(f"| {l_text} | {r_text} |")

    return "\n".join(table_lines)

# Process all items
updates = []
for it in items:
    img_rel = it['img_path']
    local_path = os.path.join(r"c:\ssczone\public", img_rel.replace('/', '\\'))
    if not os.path.exists(local_path):
        continue

    boxes_result, _ = ocr(local_path)
    if not boxes_result:
        continue

    table_md = build_2col_table(boxes_result)
    prompt = it['txt_prompt'].strip()
    if prompt:
        full_content = f"{prompt}\n\n{table_md}"
    else:
        full_content = table_md

    updates.append({
        "question_id": it["id"],
        "table_md": full_content
    })

print(f"Generated 2-column tables for {len(updates)} questions.")

# Preview first 3
for u in updates[:3]:
    print("=" * 60)
    print(f"Q#{u['question_id']}:")
    print(u['table_md'])
