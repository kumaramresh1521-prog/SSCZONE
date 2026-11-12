"""
Upload active SSCZone PYQ images and paper PDFs to Cloudflare R2 (S3-compatible).
Zero external dependencies beyond `requests` (uses built-in AWS Signature v4).

Reads credentials from c:\\ssczone\\.env.local (never hardcoded):
  - R2_ACCOUNT_ID        (or R2_S3_API=https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<bucket>)
  - R2_ACCESS_KEY_ID
  - R2_SECRET_ACCESS_KEY
  - R2_BUCKET_NAME
  - NEXT_PUBLIC_R2_PUBLIC_URL  (e.g. https://doc.ssczone.com)

Usage:
  python scripts/upload_assets_to_r2.py --dry-run
  python scripts/upload_assets_to_r2.py
  python scripts/upload_assets_to_r2.py --images-only
"""

import argparse
import concurrent.futures
import datetime
import hashlib
import hmac
import mimetypes
import os
import re
import sys
import threading
import time
from urllib.parse import quote

import requests

sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = r"c:\ssczone"
ENV_PATH = os.path.join(REPO_ROOT, ".env.local")
PUBLIC_DIR = os.path.join(REPO_ROOT, "public")
ACTIVE_IMAGE_DIRS = [
    os.path.join(PUBLIC_DIR, "images", "pyq", "2023"),
    os.path.join(PUBLIC_DIR, "images", "pyq", "2024"),
]
PAPERS_DIR = os.path.join(PUBLIC_DIR, "papers")

_THREAD_LOCAL = threading.local()


def load_env_file(path):
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            k, v = s.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            env[k] = v
    return env


def resolve_r2_config(env):
    account_id = env.get("R2_ACCOUNT_ID", "").strip()
    bucket = env.get("R2_BUCKET_NAME", "").strip()
    s3_api = env.get("R2_S3_API", "").strip()
    if s3_api:
        m = re.match(r"^https?://([a-zA-Z0-9]+)\.r2\.cloudflarestorage\.com(?:/([^/?#]+))?", s3_api)
        if m:
            account_id = account_id or m.group(1)
            bucket = bucket or (m.group(2) or "")

    access_key = env.get("R2_ACCESS_KEY_ID", "").strip()
    secret_key = env.get("R2_SECRET_ACCESS_KEY", "").strip()
    public_url = env.get("NEXT_PUBLIC_R2_PUBLIC_URL", "").strip().rstrip("/")
    missing = [
        name for name, val in [
            ("R2_ACCOUNT_ID", account_id),
            ("R2_BUCKET_NAME", bucket),
            ("R2_ACCESS_KEY_ID", access_key),
            ("R2_SECRET_ACCESS_KEY", secret_key),
        ] if not val
    ]
    if missing:
        raise RuntimeError(f"Missing required keys in .env.local: {', '.join(missing)}")
    return {
        "account_id": account_id,
        "bucket": bucket,
        "access_key": access_key,
        "secret_key": secret_key,
        "public_url": public_url,
        "host": f"{account_id}.r2.cloudflarestorage.com",
    }


def _sign(key, msg):
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def _signing_key(secret_key, date_stamp, region="auto", service="s3"):
    k_date = _sign(f"AWS4{secret_key}".encode("utf-8"), date_stamp)
    k_region = _sign(k_date, region)
    k_service = _sign(k_region, service)
    return _sign(k_service, "aws4_request")


def signed_headers(cfg, method, key_path, payload_bytes=b"", extra_headers=None):
    now = datetime.datetime.now(datetime.timezone.utc)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")
    payload_hash = hashlib.sha256(payload_bytes).hexdigest()

    canonical_uri = "/" + quote(f"{cfg['bucket']}/{key_path.lstrip('/')}", safe="/-_.~")
    headers = {
        "host": cfg["host"],
        "x-amz-content-sha256": payload_hash,
        "x-amz-date": amz_date,
    }
    if extra_headers:
        for hk, hv in extra_headers.items():
            headers[hk.lower()] = str(hv)

    signed_names = sorted(headers.keys())
    canonical_headers = "".join(f"{k}:{headers[k]}\n" for k in signed_names)
    signed_headers_str = ";".join(signed_names)

    canonical_request = "\n".join([
        method,
        canonical_uri,
        "",
        canonical_headers,
        signed_headers_str,
        payload_hash,
    ])
    scope = f"{date_stamp}/auto/s3/aws4_request"
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256",
        amz_date,
        scope,
        hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
    ])
    sig_key = _signing_key(cfg["secret_key"], date_stamp)
    signature = hmac.new(sig_key, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    auth = (
        f"AWS4-HMAC-SHA256 Credential={cfg['access_key']}/{scope}, "
        f"SignedHeaders={signed_headers_str}, Signature={signature}"
    )
    out = dict(headers)
    out["Authorization"] = auth
    url = f"https://{cfg['host']}{canonical_uri}"
    return url, out


def get_session():
    if not hasattr(_THREAD_LOCAL, "session"):
        _THREAD_LOCAL.session = requests.Session()
    return _THREAD_LOCAL.session


def collect_files(include_images=True, include_pdfs=True):
    items = []
    if include_images:
        for base in ACTIVE_IMAGE_DIRS:
            if not os.path.exists(base):
                continue
            for root, _, files in os.walk(base):
                for fn in sorted(files):
                    full = os.path.join(root, fn)
                    rel = os.path.relpath(full, PUBLIC_DIR).replace("\\", "/")
                    items.append((full, rel))
    if include_pdfs and os.path.exists(PAPERS_DIR):
        for fn in sorted(os.listdir(PAPERS_DIR)):
            if fn.lower().endswith(".pdf"):
                full = os.path.join(PAPERS_DIR, fn)
                rel = os.path.relpath(full, PUBLIC_DIR).replace("\\", "/")
                items.append((full, rel))
    return items


def guess_content_type(rel_key):
    low = rel_key.lower()
    if low.endswith(".png"):
        return "image/png"
    if low.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if low.endswith(".webp"):
        return "image/webp"
    if low.endswith(".pdf"):
        return "application/pdf"
    ct, _ = mimetypes.guess_type(rel_key)
    return ct or "application/octet-stream"


def upload_one(cfg, full_path, rel_key, skip_existing=True):
    sess = get_session()
    size = os.path.getsize(full_path)

    if skip_existing:
        for attempt in range(3):
            try:
                h_url, h_hdrs = signed_headers(cfg, "HEAD", rel_key)
                hr = sess.head(h_url, headers=h_hdrs, timeout=20)
                if hr.status_code == 200 and int(hr.headers.get("Content-Length", -1)) == size:
                    return ("skipped", rel_key, size)
                break
            except requests.RequestException:
                if attempt == 2:
                    break
                time.sleep(1.5 * (attempt + 1))

    with open(full_path, "rb") as f:
        data = f.read()

    ctype = guess_content_type(rel_key)
    extra = {
        "content-type": ctype,
        "cache-control": "public, max-age=31536000, immutable",
    }
    for attempt in range(4):
        try:
            p_url, p_hdrs = signed_headers(cfg, "PUT", rel_key, payload_bytes=data, extra_headers=extra)
            pr = sess.put(p_url, headers=p_hdrs, data=data, timeout=60)
            pr.raise_for_status()
            return ("uploaded", rel_key, size)
        except Exception as e:
            if attempt == 3:
                return ("failed", rel_key, f"{type(e).__name__}: {e}")
            time.sleep(2 ** attempt)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--images-only", action="store_true")
    ap.add_argument("--pdfs-only", action="store_true")
    ap.add_argument("--no-skip", action="store_true")
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    inc_img = not args.pdfs_only
    inc_pdf = not args.images_only
    items = collect_files(include_images=inc_img, include_pdfs=inc_pdf)
    total_bytes = sum(os.path.getsize(f) for f, _ in items)
    print(f"Prepared {len(items)} active files ({total_bytes / (1024 * 1024):.2f} MB) [orphan 2026 excluded]")

    if args.dry_run:
        print("Sample R2 keys:")
        for _, rel in items[:5]:
            print(" ", rel)
        for _, rel in items[-3:]:
            print(" ", rel)
        return

    env = load_env_file(ENV_PATH)
    cfg = resolve_r2_config(env)
    print(f"Target Bucket: {cfg['bucket']} | Endpoint Host: {cfg['host']}")

    t0 = time.time()
    counts = {"uploaded": 0, "skipped": 0, "failed": 0}
    failures = []
    done = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futs = [pool.submit(upload_one, cfg, fp, rk, not args.no_skip) for fp, rk in items]
        for fut in concurrent.futures.as_completed(futs):
            status, rk, info = fut.result()
            counts[status] += 1
            if status == "failed":
                failures.append((rk, info))
            done += 1
            if done % 250 == 0 or done == len(items):
                elapsed = time.time() - t0
                print(f"  Progress: {done}/{len(items)} ({elapsed:.1f}s) -> uploaded={counts['uploaded']}, skipped={counts['skipped']}, failed={counts['failed']}")

    if failures:
        print("\nFAILURES:")
        for rk, err in failures[:20]:
            print(f"  {rk}: {err}")
        raise SystemExit(1)

    if cfg["public_url"]:
        print("\nVerifying public CDN reachability...")
        samples = [rk for _, rk in items if rk.endswith(".png")][:1] + [rk for _, rk in items if rk.endswith(".pdf")][:1]
        for rk in samples:
            test_url = f"{cfg['public_url']}/{rk}"
            r = requests.head(test_url, timeout=15)
            print(f"  HEAD {test_url} -> HTTP {r.status_code} ({r.headers.get('Content-Type')})")
            assert r.status_code == 200, f"Public verification failed for {test_url}"

    print(f"\nDONE in {time.time() - t0:.1f}s! Uploaded={counts['uploaded']}, Skipped={counts['skipped']}, Failed=0")


if __name__ == "__main__":
    main()
