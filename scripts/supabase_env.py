"""Shared loader for Supabase credentials from environment variables or .env.local."""

import os
from pathlib import Path


def get_supabase_credentials() -> tuple[str, str]:
    """Return (supabase_url, service_role_key) without hardcoding secrets in scripts."""
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        env_path = Path(__file__).resolve().parent.parent / ".env.local"
        if env_path.exists():
            for raw_line in env_path.read_text(encoding="utf-8").splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k in ("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL") and not url:
                    url = v
                elif k == "SUPABASE_SERVICE_ROLE_KEY" and not key:
                    key = v

    if not url:
        raise RuntimeError(
            "NEXT_PUBLIC_SUPABASE_URL not found in environment variables or .env.local"
        )
    if not key:
        raise RuntimeError(
            "SUPABASE_SERVICE_ROLE_KEY not found in environment variables or .env.local"
        )
    return url, key
