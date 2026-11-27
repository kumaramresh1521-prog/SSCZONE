"""
Upload SSCZone Android APK to Cloudflare R2 CDN and verify public download reachability.

Reads R2 credentials from c:\\ssczone\\.env.local and version metadata from android-app/app.json.
Uploads both:
  - apk/SSCZone.apk                 (stable latest alias, 5-min cache)
  - apk/SSCZone-v<version>.apk      (immutable versioned archive)

Usage:
  python scripts/upload_apk_to_r2.py
  python scripts/upload_apk_to_r2.py --apk-path apk/SSCZone.apk --sync-supabase
"""

import argparse
import hashlib
import json
import os
import sys
import requests

sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO_ROOT, "scripts"))

from upload_assets_to_r2 import load_env_file, resolve_r2_config, signed_headers  # noqa: E402


def resolve_apk_source(explicit_path: str | None) -> str:
    candidates = []
    if explicit_path:
        candidates.append(explicit_path if os.path.isabs(explicit_path) else os.path.join(REPO_ROOT, explicit_path))
    candidates.extend([
        os.path.join(REPO_ROOT, "apk", "SSCZone.apk"),
        os.path.join(REPO_ROOT, "android-app", "SSCZone.apk"),
        os.path.join(REPO_ROOT, "android-app", "android", "app", "build", "outputs", "apk", "release", "app-release.apk"),
    ])
    for c in candidates:
        if os.path.exists(c) and os.path.getsize(c) > 1024:
            return c
    raise FileNotFoundError(f"No valid SSCZone.apk found in: {candidates}")


def read_app_metadata() -> dict:
    app_json = os.path.join(REPO_ROOT, "android-app", "app.json")
    if os.path.exists(app_json):
        with open(app_json, "r", encoding="utf-8") as f:
            expo = json.load(f).get("expo", {})
            return {
                "version": str(expo.get("version") or "1.2.0").strip(),
                "versionCode": int(expo.get("android", {}).get("versionCode") or 3),
                "packageName": str(expo.get("android", {}).get("package") or "com.ssczone.app"),
            }
    return {"version": "1.2.0", "versionCode": 3, "packageName": "com.ssczone.app"}


def upload_apk_key(cfg: dict, data: bytes, key_path: str, filename: str, cache_control: str) -> str:
    extra = {
        "content-type": "application/vnd.android.package-archive",
        "content-disposition": f'attachment; filename="{filename}"',
        "cache-control": cache_control,
    }
    url, hdrs = signed_headers(cfg, "PUT", key_path, payload_bytes=data, extra_headers=extra)
    resp = requests.put(url, headers=hdrs, data=data, timeout=180)
    resp.raise_for_status()
    public_url = f"{cfg['public_url']}/{key_path.lstrip('/')}" if cfg.get("public_url") else url
    return public_url


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apk-path", default=None, help="Path to SSCZone.apk")
    parser.add_argument("--sync-supabase", action="store_true", help="Also sync version metadata to Supabase mobile_app_config")
    args = parser.parse_args()

    env = load_env_file(os.path.join(REPO_ROOT, ".env.local"))
    cfg = resolve_r2_config(env)
    src_path = resolve_apk_source(args.apk_path)
    meta = read_app_metadata()

    with open(src_path, "rb") as f:
        data = f.read()

    if data[:2] != b"PK":
        raise RuntimeError(f"Invalid APK file (missing ZIP/PK header): {src_path}")

    size_bytes = len(data)
    size_mb = round(size_bytes / (1024 * 1024), 2)
    sha256 = hashlib.sha256(data).hexdigest()
    version = meta["version"]

    print(f"Source APK : {src_path}")
    print(f"Version    : v{version} (code {meta['versionCode']}, {meta['packageName']})")
    print(f"Size       : {size_bytes:,} bytes ({size_mb} MB)")
    print(f"SHA-256    : {sha256}")

    latest_url = upload_apk_key(
        cfg,
        data,
        "apk/SSCZone.apk",
        f"SSCZone-v{version}.apk",
        "public, max-age=300",
    )
    versioned_url = upload_apk_key(
        cfg,
        data,
        f"apk/SSCZone-v{version}.apk",
        f"SSCZone-v{version}.apk",
        "public, max-age=31536000, immutable",
    )

    print(f"Uploaded Latest    : {latest_url}")
    print(f"Uploaded Versioned : {versioned_url}")

    for verify_url in (latest_url, versioned_url):
        hr = requests.head(verify_url, timeout=20, allow_redirects=True)
        print(f"HEAD {verify_url} -> HTTP {hr.status_code} | Content-Type={hr.headers.get('Content-Type')} | Length={hr.headers.get('Content-Length')}")
        if hr.status_code != 200 or int(hr.headers.get("Content-Length", "0")) != size_bytes:
            raise RuntimeError(f"Verification failed for {verify_url}")

    # Update local apk metadata manifest for the website UI
    meta_out = {
        "version": version,
        "versionCode": meta["versionCode"],
        "packageName": meta["packageName"],
        "sizeBytes": size_bytes,
        "sizeLabel": f"{size_mb:.1f} MB",
        "sha256": sha256,
        "cdnUrl": latest_url,
        "versionedCdnUrl": versioned_url,
        "minAndroid": "Android 7.0+",
    }
    manifest_path = os.path.join(REPO_ROOT, "src", "data", "mobile-app-release.json")
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(meta_out, mf, indent=2)
    print(f"Updated manifest   : {manifest_path}")

    if args.sync_supabase and env.get("NEXT_PUBLIC_SUPABASE_URL") and env.get("SUPABASE_SERVICE_ROLE_KEY"):
        sb_url = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
        sb_key = env["SUPABASE_SERVICE_ROLE_KEY"]
        hdrs = {
            "apikey": sb_key,
            "Authorization": f"Bearer {sb_key}",
            "Content-Type": "application/json",
        }
        get_r = requests.get(f"{sb_url}/rest/v1/site_settings?key=eq.mobile_app_config&select=value", headers=hdrs, timeout=15)
        rows = get_r.json() if get_r.ok else []
        current_val = rows[0]["value"] if rows else {}
        ver_obj = current_val.get("version") or {}
        ver_obj["latestVersion"] = version
        ver_obj["downloadUrl"] = latest_url
        current_val["version"] = ver_obj
        post_r = requests.post(
            f"{sb_url}/rest/v1/site_settings",
            headers={**hdrs, "Prefer": "resolution=merge-duplicates"},
            json={"key": "mobile_app_config", "value": current_val},
            timeout=15,
        )
        post_r.raise_for_status()
        print("Synced mobile_app_config.version.downloadUrl in Supabase!")


if __name__ == "__main__":
    main()
