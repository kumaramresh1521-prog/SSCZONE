import os
import sys
import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from upload_assets_to_r2 import load_env_file, resolve_r2_config, signed_headers

ENG_DIR = r"c:\ssczone\public\notes\english"

def upload_all_english_notes():
    env = load_env_file('.env.local')
    cfg = resolve_r2_config(env)

    print(f"Connecting to Cloudflare R2: {cfg['bucket']} on {cfg['host']}...")

    files = sorted(os.listdir(ENG_DIR))
    uploaded = 0

    for fn in files:
        if not fn.endswith(".pdf"):
            continue

        full_path = os.path.join(ENG_DIR, fn)
        with open(full_path, "rb") as f:
            data = f.read()

        # R2 object key
        key_path = f"notes/english/{fn}"
        url, headers = signed_headers(
            cfg,
            "PUT",
            key_path,
            payload_bytes=data,
            extra_headers={"Content-Type": "application/pdf"}
        )

        try:
            r = requests.put(url, headers=headers, data=data, timeout=60)
            if r.status_code in (200, 201):
                uploaded += 1
                public_link = f"{cfg['public_url']}/{key_path}"
                print(f"✅ Uploaded [{uploaded}/{len(files)}]: {fn} -> {public_link}")
            else:
                print(f"❌ Failed {fn}: Status {r.status_code} - {r.text[:100]}")
        except Exception as e:
            print(f"⚠️ Exception uploading {fn}: {e}")

    print(f"\nDone! Successfully uploaded {uploaded} of {len(files)} files to Cloudflare R2.")

if __name__ == '__main__':
    upload_all_english_notes()
