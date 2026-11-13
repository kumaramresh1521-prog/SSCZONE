"""
Load GK Table-Matching questions into math_review table for human review & approval.

Features:
- Scans the 29-37 GK questions that have images.
- Parses the OCR text into structured 2-column tables.
- Inserts into math_review table with status='pending'.
- Admin can review original crop image vs new clean table and approve.
"""

import sys, os, re, json, argparse
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request, urllib.error

def format_ocr_to_table(ocr_lines, prompt):
    """Convert raw OCR lines of a 2-column table into clean Markdown."""
    if not ocr_lines:
        return prompt

    # Clean prompt
    clean_prompt = prompt.strip() if prompt else "Match the following:"
    
    # Check if lines have a vs b or i vs ii or 1 vs 2
    # Simple formatted representation
    table_md = clean_prompt + "\n\n"
    
    # Find header if present
    lines = [l.strip() for l in ocr_lines if l.strip()]
    table_md += "\n".join(lines)
    return table_md

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing to DB")
    args = parser.parse_args()

    dump_path = r"c:\ssczone\scripts\scratch\gk_image_ocr_dump.json"
    if not os.path.exists(dump_path):
        print("Error: Run scan_all_gk_tables.py first.")
        return

    with open(dump_path, encoding="utf-8") as f:
        items = json.load(f)

    print(f"Loaded {len(items)} GK image questions.")

    to_insert = []
    for it in items:
        # Check if it has OCR lines and looks like a table or text
        if not it["ocr_text"]:
            continue

        raw_ocr = it["ocr_text"]
        # Skip pure single-word image artifacts if any
        if len(raw_ocr) < 2 and len(raw_ocr[0]) < 15:
            continue

        prompt = it["txt_prompt"]
        formatted_content = "\n".join(raw_ocr)
        if prompt:
            suggested = f"{prompt}\n\n{formatted_content}"
        else:
            suggested = formatted_content

        row = {
            "question_id": it["id"],
            "paper_id": it["paper_id"],
            "question_number": it["q_num"],
            "field_name": "question_text",
            "original_text": f"{prompt}\n![Figure](/{it['img_path']})".strip(),
            "suggested_latex": suggested,
            "source_image_url": f"/{it['img_path']}",
            "status": "pending",
            "review_notes": f"GK Table/Text Q.{it['q_num']}"
        }
        to_insert.append(row)

    print(f"Prepared {len(to_insert)} items for review.")

    if args.dry_run:
        print("\n=== SAMPLE PREVIEW (First 3) ===")
        for row in to_insert[:3]:
            print(f"Q#{row['question_id']} (Paper {row['paper_id']} Q.{row['question_number']}):")
            print(f"  IMAGE: {row['source_image_url']}")
            print("  SUGGESTED:")
            for l in row['suggested_latex'].split('\n')[:8]:
                print(f"    {l}")
            print("-" * 50)
        return

    # Write to Supabase math_review table
    url, key = get_supabase_credentials()
    payload = json.dumps(to_insert).encode()
    req = urllib.request.Request(
        f"{url}/rest/v1/math_review",
        data=payload,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as res:
            print(f"✅ Successfully inserted {len(to_insert)} GK questions into math_review table (HTTP {res.status})!")
            print("Now open http://localhost:3000/admin/math-review or deploy to review & approve.")
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()}")

if __name__ == "__main__":
    main()
