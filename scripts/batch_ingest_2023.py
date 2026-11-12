import argparse
import gc
import json
import os
import sys
import time

sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = r"c:\ssczone"
SCRIPTS_DIR = os.path.join(REPO_ROOT, "scripts")
MANIFEST_PATH = os.path.join(SCRIPTS_DIR, "manifest_2023.json")
BACKUP_DIR = os.path.join(REPO_ROOT, "src", "data", "pyq_backup")
PDF_DIR = r"E:\pyq\ssc cgl\2023"
STATUS_PATH = os.path.join(REPO_ROOT, "scripts", "ingestion_progress_2023.json")

sys.path.insert(0, SCRIPTS_DIR)
import convert_digialm_2023_single as c23
import fitz

def load_manifest():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def is_paper_ingested(slug):
    backup_file = os.path.join(BACKUP_DIR, f"{slug}.json")
    if os.path.exists(backup_file):
        try:
            with open(backup_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return len(data) == 100
        except Exception:
            return False
    return False

def find_pdf_file(item):
    # Try canonical renamed filename first
    p1 = os.path.join(PDF_DIR, item["pdf_filename"])
    if os.path.isfile(p1):
        return p1
    # Try original filename
    p2 = os.path.join(PDF_DIR, item["file"])
    if os.path.isfile(p2):
        return p2
    return None

def main():
    parser = argparse.ArgumentParser(description="Batch Ingest 2023 Papers")
    parser.add_argument("--type", choices=["A", "B", "ALL"], default="ALL", help="Filter by Type A, Type B, or ALL")
    parser.add_argument("--limit", type=int, default=0, help="Maximum number of papers to process in this run (0 = unlimited)")
    parser.add_argument("--force", action="store_true", help="Re-process already ingested papers")
    args = parser.parse_args()

    manifest = load_manifest()
    
    # Filter
    queue = []
    for item in manifest:
        if args.type != "ALL" and item["type"] != args.type:
            continue
        if not args.force and is_paper_ingested(item["slug"]):
            continue
        queue.append(item)

    total_all = len(manifest)
    already_done = total_all - len([m for m in manifest if not is_paper_ingested(m["slug"])])
    
    print(f"\n=======================================================")
    print(f"BATCH INGESTION RUNNER - SSC CGL 2023")
    print(f"Total Papers in Manifest: {total_all}")
    print(f"Already Completed:        {already_done}/{total_all} ({already_done/total_all*100:.1f}%)")
    print(f"Queue Size (Type={args.type}): {len(queue)} papers")
    if args.limit > 0:
        queue = queue[:args.limit]
        print(f"Limited to:               {len(queue)} papers")
    print(f"=======================================================\n")

    if not queue:
        print("All requested papers are already completed! Nothing to do.")
        return

    processed_in_run = 0
    start_run_time = time.time()
    per_paper_times = []

    for idx, item in enumerate(queue, 1):
        pdf_path = find_pdf_file(item)
        if not pdf_path:
            print(f"ERROR: Could not find PDF for {item['file']} / {item['pdf_filename']}")
            continue

        print(f"\n[{idx}/{len(queue)}] Starting: {item['db_title']} (Type {item['type']})")
        t0 = time.time()
        try:
            meta, questions = c23.process_one_2023_pdf(pdf_path, apply=True)
            elapsed = time.time() - t0
            per_paper_times.append(elapsed)
            processed_in_run += 1

            avg_time = sum(per_paper_times) / len(per_paper_times)
            rem_papers = len(queue) - idx
            eta_seconds = rem_papers * avg_time
            eta_mins = eta_seconds / 60.0

            curr_done = sum(1 for m in manifest if is_paper_ingested(m["slug"]))
            pct = curr_done / total_all * 100.0

            print(f"[{idx}/{len(queue)}] SUCCESS: {item['db_title']} completed in {elapsed:.1f}s")
            print(f"      Overall Progress: {curr_done}/{total_all} ({pct:.1f}%) | Batch ETA: ~{eta_mins:.1f} min")

            # Update progress status file
            with open(STATUS_PATH, "w", encoding="utf-8") as f:
                json.dump({
                    "last_completed": item["slug"],
                    "total_completed": curr_done,
                    "total_papers": total_all,
                    "percent_complete": round(pct, 1),
                    "last_paper_time_sec": round(elapsed, 1),
                    "avg_paper_time_sec": round(avg_time, 1),
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }, f, indent=2)

        except Exception as e:
            print(f"ERROR processing {item['file']}: {e}")
            import traceback
            traceback.print_exc()

        # Clean memory between runs
        fitz.TOOLS.store_shrink(100)
        gc.collect()

    total_run_time = time.time() - start_run_time
    print(f"\n=======================================================")
    print(f"BATCH FINISHED: Processed {processed_in_run} papers in {total_run_time/60.0:.1f} min.")
    print(f"=======================================================")

if __name__ == "__main__":
    main()
