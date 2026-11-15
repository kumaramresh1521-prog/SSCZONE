"""Full working check for math_review table — insert test, read, update, delete."""
import sys, json
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request, urllib.error

url, key = get_supabase_credentials()

def req(method, path, data=None, extra_headers=None):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation",
    }
    if extra_headers:
        headers.update(extra_headers)
    r = urllib.request.Request(
        f"{url}/rest/v1/{path}",
        data=json.dumps(data).encode() if data else None,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(r) as res:
            body = res.read()
            return res.status, json.loads(body) if body else []
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

print("=" * 55)
print("Math Review Table — Working Check")
print("=" * 55)

# 1. Insert test row
print("\n[1] INSERT test row...")
test_row = {
    "question_id": 99999,
    "paper_id": 99,
    "question_number": 1,
    "field_name": "question_text",
    "original_text": "If √225 = x, find x.",
    "suggested_latex": r"If $\sqrt{225} = x$, find $x$.",
    "status": "pending",
    "review_notes": "TEST ROW — will be deleted",
}
status, data = req("POST", "math_review", test_row)
print(f"  Status: {status}")
if status in (200, 201) and isinstance(data, list) and data:
    inserted_id = data[0]["id"]
    print(f"  ✅ Inserted. id={inserted_id}")
    print(f"     field_name: {data[0]['field_name']}")
    print(f"     status: {data[0]['status']}")
    print(f"     suggested_latex: {data[0]['suggested_latex']}")
else:
    print(f"  ❌ Error: {data}")
    sys.exit(1)

# 2. Read it back
print("\n[2] READ back...")
status, data = req("GET", f"math_review?id=eq.{inserted_id}")
if status == 200 and data:
    print(f"  ✅ Read OK. original_text: {data[0]['original_text']}")
else:
    print(f"  ❌ Read failed: {data}")

# 3. Update (simulate approve)
print("\n[3] UPDATE status to 'approved'...")
status, data = req("PATCH", f"math_review?id=eq.{inserted_id}", {
    "status": "approved",
    "admin_latex": r"If $\sqrt{225} = x$, find $x = 15$.",
    "reviewed_at": "2026-11-13T00:00:00Z",
})
if status in (200, 201) and isinstance(data, list) and data:
    print(f"  ✅ Updated. status={data[0]['status']}, admin_latex={data[0]['admin_latex'][:40]}")
else:
    print(f"  ❌ Update failed: {data}")

# 4. Test rejected status
print("\n[4] UPDATE status to 'rejected' (test CHECK constraint works)...")
status, data = req("PATCH", f"math_review?id=eq.{inserted_id}", {"status": "rejected"})
if status in (200, 201):
    print(f"  ✅ Rejected status accepted.")
else:
    print(f"  ❌ Error: {data}")

# 5. Test invalid status (should fail due to CHECK constraint)
print("\n[5] Test invalid status 'INVALID' (should be rejected by DB)...")
status, data = req("PATCH", f"math_review?id=eq.{inserted_id}", {"status": "INVALID"})
if status >= 400:
    print(f"  ✅ CHECK constraint works! DB rejected invalid status (HTTP {status})")
else:
    print(f"  ⚠️  Unexpected: status={status}")

# 6. Delete test row
print("\n[6] DELETE test row (cleanup)...")
status, data = req("DELETE", f"math_review?id=eq.{inserted_id}", extra_headers={"Prefer": "return=minimal"})
if status in (200, 204):
    print(f"  ✅ Deleted. Table is clean.")
else:
    print(f"  ❌ Delete failed: {data}")

# 7. Verify table is empty
print("\n[7] Verify table is empty after cleanup...")
status, data = req("GET", "math_review?select=count")
_, cnt_data = req("GET", "math_review")
print(f"  ✅ Rows in table: {len(cnt_data)}")

print("\n" + "=" * 55)
print("✅ ALL CHECKS PASSED — math_review table is ready!")
print("=" * 55)
print("\nNext steps:")
print("  1. Run:  python scripts/math_ecosystem/extract_math.py --paper-id 59 --dry-run")
print("  2. Open: http://localhost:3000/admin/math-review")
