"""
Math Ecosystem — Step 1: Extractor
Scans paper_questions in Supabase, finds questions with [IMG:...] tags
or raw math text, generates suggested LaTeX, and loads into math_review table.

Usage:
    python extract_math.py                        # scan all papers
    python extract_math.py --paper-id 59          # scan specific paper
    python extract_math.py --dry-run              # preview without writing to DB
"""

import sys, re, json, argparse
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request, urllib.error, urllib.parse

# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------
IMG_TAG_RE  = re.compile(r'\[IMG:([^\]]+)\]')
MATH_PATTERNS = [
    # Fractions like 2/3, 7/4 surrounded by spaces or operators
    (re.compile(r'(?<!\w)(\d+)\s*/\s*(\d+)(?!\w)'), r'\\frac{\1}{\2}'),
    # Square roots: √225, √(x+y)
    (re.compile(r'√\(([^)]+)\)'), r'\\sqrt{\1}'),
    (re.compile(r'√(\d+)'), r'\\sqrt{\1}'),
    # Superscripts (unicode)
    (re.compile(r'(\w)²'), r'\1^{2}'),
    (re.compile(r'(\w)³'), r'\1^{3}'),
    # Percentage with space weirdness
    (re.compile(r'(\d+)\s*%'), r'\1\\%'),
]

FIELD_NAMES = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d']

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def supabase_get(url, key, path, params=None):
    full = f"{url}/rest/v1/{path}"
    if params:
        full += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(full, headers={
        "apikey": key, "Authorization": f"Bearer {key}", "Accept": "application/json"
    })
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read())


def supabase_upsert(url, key, table, rows):
    payload = json.dumps(rows).encode()
    req = urllib.request.Request(
        f"{url}/rest/v1/{table}",
        data=payload,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=minimal",  # skip existing
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as res:
            return res.status
    except urllib.error.HTTPError as e:
        print(f"  Upsert error {e.code}: {e.read().decode()[:200]}")
        return e.code


def has_math_content(text):
    """Return True if text likely contains math that should be LaTeX-ified."""
    if not text:
        return False
    if IMG_TAG_RE.search(text):
        return True
    if re.search(r'[√²³½¼¾∛∜]', text):
        return True
    if re.search(r'(?<!\w)\d+\s*/\s*\d+(?!\w)', text):
        return True
    return False


def suggest_latex(text):
    """
    Convert raw math text to a LaTeX suggestion.
    Returns the suggested LaTeX string.
    Strategy:
      1. If only an [IMG:...] tag with no surrounding text → keep as image (None)
      2. If mixed text + math → wrap math parts in $...$
      3. Apply known substitutions
    """
    if not text:
        return None

    stripped = text.strip()

    # Pure image tag — no text around it → not convertible, skip
    if IMG_TAG_RE.fullmatch(stripped):
        return None

    # Image tags embedded in text → mark as "contains image, review manually"
    if IMG_TAG_RE.search(stripped):
        # Replace [IMG:...] with a placeholder note
        result = IMG_TAG_RE.sub(r'[🖼 image: \1]', stripped)
        return result  # Admin will decide

    # Apply math substitutions
    result = stripped
    for pattern, replacement in MATH_PATTERNS:
        result = pattern.sub(replacement, result)

    # If result changed, it has math content
    if result != stripped:
        return result

    return None  # No useful conversion found


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description='Math Ecosystem Extractor')
    parser.add_argument('--paper-id', type=int, help='Scan only this paper ID')
    parser.add_argument('--dry-run', action='store_true', help='Preview without writing to DB')
    parser.add_argument('--limit', type=int, default=5000, help='Max questions to scan')
    args = parser.parse_args()

    sb_url, sb_key = get_supabase_credentials()

    print("=" * 60)
    print("Math Ecosystem — Extractor")
    print("=" * 60)

    # Fetch questions
    params = {
        "select": "id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d",
        "limit": args.limit,
        "order": "id.asc",
    }
    if args.paper_id:
        params["paper_id"] = f"eq.{args.paper_id}"

    print(f"\nFetching questions (paper_id={'all' if not args.paper_id else args.paper_id})...")
    questions = supabase_get(sb_url, sb_key, "paper_questions", params)
    print(f"Fetched {len(questions)} questions.\n")

    to_insert = []
    found = 0

    for q in questions:
        qid = q['id']
        for field in FIELD_NAMES:
            text = q.get(field) or ''
            if not has_math_content(text):
                continue

            suggested = suggest_latex(text)

            row = {
                "question_id":      qid,
                "paper_id":         q['paper_id'],
                "question_number":  q.get('question_number'),
                "field_name":       field,
                "original_text":    text,
                "suggested_latex":  suggested,
                "status":           "pending",
            }
            to_insert.append(row)
            found += 1

            if args.dry_run:
                print(f"  Q#{qid} [{field}]:")
                print(f"    ORIGINAL : {text[:100]}")
                print(f"    SUGGESTED: {str(suggested)[:100]}")
                print()

    print(f"\nTotal math entries found: {found}")

    if args.dry_run:
        print("\n[DRY RUN] Nothing written to DB.")
        return

    if not to_insert:
        print("Nothing to insert.")
        return

    # Insert in batches of 100
    batch_size = 100
    inserted = 0
    for i in range(0, len(to_insert), batch_size):
        batch = to_insert[i:i+batch_size]
        status = supabase_upsert(sb_url, sb_key, "math_review", batch)
        if status in (200, 201):
            inserted += len(batch)
            print(f"  Batch {i//batch_size + 1}: Inserted {len(batch)} rows (status {status})")
        else:
            print(f"  Batch {i//batch_size + 1}: Error status {status}")

    print(f"\nDone! {inserted}/{found} entries added to math_review table.")
    print("Now open Admin Panel → Math Review to start approving.")


if __name__ == "__main__":
    main()
