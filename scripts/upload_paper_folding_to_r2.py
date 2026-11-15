"""
Upload all 293 Paper Cutting & Folding images to Cloudflare R2 bucket 'ssczone-assets'
and update Supabase questions table with the public CDN URLs (https://doc.ssczone.com/...).
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import concurrent.futures
import time
import requests
from upload_assets_to_r2 import load_env_file, resolve_r2_config, upload_one
from supabase_env import get_supabase_credentials

IMAGES_DIR = os.path.join("public", "images", "questions", "paper_folding")

def main():
    env = load_env_file(".env.local")
    cfg = resolve_r2_config(env)
    print(f"R2 Config: Bucket={cfg['bucket']} | CDN={cfg['public_url']}")
    
    # 1. Collect all 293 images
    files_to_upload = []
    for q_num in range(1, 294):
        fn = f"q_{q_num}.png"
        fp = os.path.join(IMAGES_DIR, fn)
        rel_key = f"images/questions/paper_folding/{fn}"
        if os.path.exists(fp):
            files_to_upload.append((fp, rel_key, q_num))
        else:
            print(f"Warning: Local file missing: {fp}")
            
    print(f"Found {len(files_to_upload)} images to upload to Cloudflare R2.")
    
    # 2. Upload in parallel (16 threads)
    t0 = time.time()
    uploaded = 0
    skipped = 0
    failed = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        futs = {
            pool.submit(upload_one, cfg, fp, rel_key, skip_existing=False): (fp, rel_key, q_num)
            for fp, rel_key, q_num in files_to_upload
        }
        for fut in concurrent.futures.as_completed(futs):
            fp, rel_key, q_num = futs[fut]
            try:
                status, rk, info = fut.result()
                if status == "uploaded":
                    uploaded += 1
                elif status == "skipped":
                    skipped += 1
                else:
                    failed.append((rel_key, info))
            except Exception as e:
                failed.append((rel_key, str(e)))
                
            total_done = uploaded + skipped + len(failed)
            if total_done % 50 == 0 or total_done == len(files_to_upload):
                pct = int((total_done / len(files_to_upload)) * 100)
                print(f"[{pct}%] Uploaded {total_done}/{len(files_to_upload)} to R2 ({time.time() - t0:.1f}s)")
                
    if failed:
        print(f"FAILED {len(failed)} files:", failed[:5])
        return
        
    print(f"\nAll {uploaded} images successfully uploaded to Cloudflare R2!")
    
    # 3. Verify public CDN sample
    sample_url = f"{cfg['public_url']}/images/questions/paper_folding/q_50.png"
    r = requests.head(sample_url, timeout=10)
    print(f"CDN Verification: {sample_url} -> HTTP {r.status_code} ({r.headers.get('Content-Type')})")
    assert r.status_code == 200, f"Failed to reach {sample_url}"
    
    # 4. Update Supabase questions table with CDN URLs
    url, key = get_supabase_credentials()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    # Fetch questions for topic 247 ordered by id asc
    resp = requests.get(f"{url}/rest/v1/questions?topic_id=eq.247&order=id.asc&limit=350&select=id", headers=headers)
    db_rows = resp.json()
    print(f"\nUpdating {len(db_rows)} records in Supabase with Cloudflare R2 CDN URLs...")
    
    updated_count = 0
    for idx, row in enumerate(db_rows):
        q_num = idx + 1
        row_id = row["id"]
        cdn_url = f"{cfg['public_url']}/images/questions/paper_folding/q_{q_num}.png"
        
        patch_resp = requests.patch(
            f"{url}/rest/v1/questions?id=eq.{row_id}",
            headers=headers,
            json={"image_url": cdn_url}
        )
        if patch_resp.status_code in [200, 204]:
            updated_count += 1
        else:
            print(f"Error updating question id {row_id}: {patch_resp.status_code} {patch_resp.text}")
            
        if (idx + 1) % 50 == 0 or (idx + 1) == len(db_rows):
            pct = int(((idx + 1) / len(db_rows)) * 100)
            print(f"[{pct}%] Updated {idx + 1}/{len(db_rows)} question records in Supabase.")
            
    print(f"\nSUCCESS: All {updated_count} questions updated with Cloudflare R2 CDN URLs!")

if __name__ == "__main__":
    main()
