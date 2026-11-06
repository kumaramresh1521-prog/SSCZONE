import os
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
out_dir = r"c:\ssczone\compiled_verification_txt"
e_dir = r"E:\pyq pdf\compiled_verification"
pub_dir = r"c:\ssczone\public\verification_txt"

os.makedirs(out_dir, exist_ok=True)
os.makedirs(e_dir, exist_ok=True)
os.makedirs(pub_dir, exist_ok=True)

files = glob.glob(os.path.join(backup_dir, "*.txt"))
files_2026 = sorted([f for f in files if "2026" in os.path.basename(f)])
files_2025 = sorted([f for f in files if "2025" in os.path.basename(f)])

print(f"Total TXT Files Found: {len(files)}")
print(f"  - 2026 Files: {len(files_2026)}")
print(f"  - 2025 Files: {len(files_2025)}")

def clean_title_from_filename(filename):
    base = os.path.splitext(os.path.basename(filename))[0]
    parts = base.split("-")
    # e.g. ssc-cgl-2026-30-september-2026-shift-2 -> SSC CGL 2026 (30 September 2026 Shift 2)
    return base.replace("-", " ").upper()

# ─────────────────────────────────────────────────────────────
# 1. BUILD SSC CGL 2026 ALL 29 SHIFTS COMPILED
# ─────────────────────────────────────────────────────────────
file_2026_path = os.path.join(out_dir, "SSC_CGL_2026_ALL_29_SHIFTS_COMPILED.txt")
with open(file_2026_path, "w", encoding="utf-8") as out_f:
    out_f.write("=" * 80 + "\n")
    out_f.write("SSCZONE - SSC CGL 2026 ALL 29 SHIFTS COMPILED VERIFICATION ARCHIVE\n")
    out_f.write("Total Shift Papers: 29 Shifts (Held between 30 Sept 2026 to 13 Oct 2026)\n")
    out_f.write("Language: Official English Shift Papers (Extracted from Answer Keys)\n")
    out_f.write("=" * 80 + "\n\n")
    
    out_f.write("TABLE OF CONTENTS (INDEX FOR CTRL+F SEARCH):\n")
    out_f.write("-" * 80 + "\n")
    for idx, f in enumerate(files_2026, 1):
        name = os.path.basename(f)
        out_f.write(f"[{idx:02d}/29] SHIFT_{idx:02d}: {clean_title_from_filename(f)} ({name})\n")
    out_f.write("-" * 80 + "\n\n")

    for idx, f in enumerate(files_2026, 1):
        name = os.path.basename(f)
        title = clean_title_from_filename(f)
        with open(f, "r", encoding="utf-8") as inf:
            content = inf.read()

        out_f.write("\n" + "#" * 80 + "\n")
        out_f.write(f"### [SHIFT {idx:02d}/29] - {title}\n")
        out_f.write(f"### Filename: {name}\n")
        out_f.write("#" * 80 + "\n\n")
        out_f.write(content.strip() + "\n\n")

print(f"Created: {file_2026_path}")

# ─────────────────────────────────────────────────────────────
# 2. BUILD SSC CGL 2025 ALL 21 SHIFTS COMPILED
# ─────────────────────────────────────────────────────────────
file_2025_path = os.path.join(out_dir, "SSC_CGL_2025_ALL_21_SHIFTS_COMPILED.txt")
with open(file_2025_path, "w", encoding="utf-8") as out_f:
    out_f.write("=" * 80 + "\n")
    out_f.write("SSCZONE - SSC CGL 2025 ALL 21 SHIFTS COMPILED VERIFICATION ARCHIVE\n")
    out_f.write("Total Shift Papers: 21 Shifts (Held between 12 Sept 2025 to 19 Sept 2025)\n")
    out_f.write("Language: Bilingual (English + Authentic Official Hindi)\n")
    out_f.write("=" * 80 + "\n\n")
    
    out_f.write("TABLE OF CONTENTS (INDEX FOR CTRL+F SEARCH):\n")
    out_f.write("-" * 80 + "\n")
    for idx, f in enumerate(files_2025, 1):
        name = os.path.basename(f)
        out_f.write(f"[{idx:02d}/21] SHIFT_{idx:02d}: {clean_title_from_filename(f)} ({name})\n")
    out_f.write("-" * 80 + "\n\n")

    for idx, f in enumerate(files_2025, 1):
        name = os.path.basename(f)
        title = clean_title_from_filename(f)
        with open(f, "r", encoding="utf-8") as inf:
            content = inf.read()

        out_f.write("\n" + "#" * 80 + "\n")
        out_f.write(f"### [SHIFT {idx:02d}/21] - {title}\n")
        out_f.write(f"### Filename: {name}\n")
        out_f.write("#" * 80 + "\n\n")
        out_f.write(content.strip() + "\n\n")

print(f"Created: {file_2025_path}")

# ─────────────────────────────────────────────────────────────
# 3. BUILD MASTER ALL 50 SHIFTS COMPILED
# ─────────────────────────────────────────────────────────────
file_master_path = os.path.join(out_dir, "ALL_PAPERS_MASTER_50_SHIFTS_COMPILED.txt")
with open(file_master_path, "w", encoding="utf-8") as out_f:
    out_f.write("=" * 80 + "\n")
    out_f.write("SSCZONE - MASTER QUESTION BANK VERIFICATION ARCHIVE (ALL 50 SHIFTS)\n")
    out_f.write("Total Papers: 50 Shifts (21 Shifts 2025 + 29 Shifts 2026)\n")
    out_f.write("Total Questions: 5,000 Verified Questions with Official Answer Keys\n")
    out_f.write("Platform: SSCZONE (https://ssczone.com)\n")
    out_f.write("=" * 80 + "\n\n")

    out_f.write("TABLE OF CONTENTS (MASTER INDEX):\n")
    out_f.write("PART 1: SSC CGL 2026 SHIFTS (29 Shifts)\n")
    out_f.write("-" * 80 + "\n")
    for idx, f in enumerate(files_2026, 1):
        out_f.write(f"[2026 - {idx:02d}/29] {clean_title_from_filename(f)}\n")
    out_f.write("\nPART 2: SSC CGL 2025 SHIFTS (21 Shifts)\n")
    out_f.write("-" * 80 + "\n")
    for idx, f in enumerate(files_2025, 1):
        out_f.write(f"[2025 - {idx:02d}/21] {clean_title_from_filename(f)}\n")
    out_f.write("=" * 80 + "\n\n")

    # Write 2026
    for idx, f in enumerate(files_2026, 1):
        with open(f, "r", encoding="utf-8") as inf:
            content = inf.read()
        out_f.write("\n" + "#" * 80 + "\n")
        out_f.write(f"### [2026 SHIFT {idx:02d}/29] - {clean_title_from_filename(f)}\n")
        out_f.write("#" * 80 + "\n\n")
        out_f.write(content.strip() + "\n\n")

    # Write 2025
    for idx, f in enumerate(files_2025, 1):
        with open(f, "r", encoding="utf-8") as inf:
            content = inf.read()
        out_f.write("\n" + "#" * 80 + "\n")
        out_f.write(f"### [2025 SHIFT {idx:02d}/21] - {clean_title_from_filename(f)}\n")
        out_f.write("#" * 80 + "\n\n")
        out_f.write(content.strip() + "\n\n")

print(f"Created: {file_master_path}")

# ─────────────────────────────────────────────────────────────
# 4. COPY TO E:\pyq pdf\compiled_verification AND public\verification_txt
# ─────────────────────────────────────────────────────────────
for fname in ["SSC_CGL_2026_ALL_29_SHIFTS_COMPILED.txt", "SSC_CGL_2025_ALL_21_SHIFTS_COMPILED.txt", "ALL_PAPERS_MASTER_50_SHIFTS_COMPILED.txt"]:
    src = os.path.join(out_dir, fname)
    dst_e = os.path.join(e_dir, fname)
    dst_pub = os.path.join(pub_dir, fname)

    with open(src, "rb") as s, open(dst_e, "wb") as de:
        de.write(s.read())

    with open(src, "rb") as s, open(dst_pub, "wb") as dp:
        dp.write(s.read())

print(f"\nAll files copied to:")
print(f"  1. {out_dir}")
print(f"  2. {e_dir}")
print(f"  3. {pub_dir}")
print("SUCCESS!")
