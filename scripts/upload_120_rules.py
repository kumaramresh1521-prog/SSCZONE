import os
import sys
import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from upload_assets_to_r2 import load_env_file, resolve_r2_config, signed_headers

def main():
    env = load_env_file('.env.local')
    cfg = resolve_r2_config(env)

    filepath = r"c:\ssczone\public\notes\english\120_rules_of_grammar_master_notes.pdf"
    with open(filepath, "rb") as f:
        data = f.read()

    key_path = "notes/english/120_rules_of_grammar_master_notes.pdf"
    url, headers = signed_headers(
        cfg,
        "PUT",
        key_path,
        payload_bytes=data,
        extra_headers={"Content-Type": "application/pdf"}
    )

    print(f"Uploading {filepath} ({len(data)} bytes) to R2 key '{key_path}'...")
    r = requests.put(url, headers=headers, data=data, timeout=60)
    print("Upload status:", r.status_code)
    if r.status_code in (200, 201):
        pub = f"{cfg['public_url']}/{key_path}"
        print("Live URL:", pub)
        # Verify public access
        vr = requests.head(pub, timeout=10)
        print("HEAD verification:", vr.status_code, "Length:", vr.headers.get("content-length"))
    else:
        print("Upload failed:", r.status_code, r.text[:200])

if __name__ == "__main__":
    main()
