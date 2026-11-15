"""
Create the math_review table in Supabase via SQL RPC.
Safe — only creates a new table, touches nothing existing.
"""
import sys, json
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request, urllib.error

url, key = get_supabase_credentials()
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

# We'll create the table step by step using Supabase's SQL endpoint
sql = """
CREATE TABLE IF NOT EXISTS public.math_review (
  id               BIGSERIAL PRIMARY KEY,
  question_id      BIGINT NOT NULL,
  paper_id         BIGINT NOT NULL,
  question_number  INTEGER,
  field_name       TEXT NOT NULL DEFAULT 'question_text',
  original_text    TEXT NOT NULL,
  suggested_latex  TEXT,
  admin_latex      TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  source_image_url TEXT,
  review_notes     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  CONSTRAINT math_review_unique_q_field UNIQUE (question_id, field_name)
);

CREATE INDEX IF NOT EXISTS math_review_status_idx   ON public.math_review (status);
CREATE INDEX IF NOT EXISTS math_review_paper_id_idx ON public.math_review (paper_id);
CREATE INDEX IF NOT EXISTS math_review_created_idx  ON public.math_review (created_at DESC);
"""

payload = json.dumps({"query": sql}).encode()
req = urllib.request.Request(
    f"{url}/rest/v1/rpc/exec_sql",
    data=payload,
    headers=headers,
    method="POST",
)
try:
    with urllib.request.urlopen(req) as res:
        print("RPC success:", res.status, res.read().decode()[:200])
except urllib.error.HTTPError as e:
    body = e.read().decode()
    # Supabase doesn't expose exec_sql by default — use pg_dump path instead
    print(f"RPC not available (HTTP {e.code}): {body[:200]}")
    print("\nWill use Supabase migrations API...")
    
    # Try the SQL query via management API
    mgmt_req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/rmobqopitkjobcnyqzru/database/query",
        data=payload,
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(mgmt_req) as mres:
            print("MGMT API success:", mres.status)
    except urllib.error.HTTPError as me:
        mbody = me.read().decode()
        print(f"MGMT API also failed (HTTP {me.code}): {mbody[:200]}")
        print("\n=> Please run create_math_review_table.sql manually in Supabase SQL Editor.")
        print("   Path: c:\\ssczone\\scripts\\math_ecosystem\\create_math_review_table.sql")
