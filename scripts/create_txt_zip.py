import os
import zipfile
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"

papers_ordered = [
    ("ssc-cgl-2025-12-september-2025-shift-1.txt", "01_SSC_CGL_2025_12_Sept_Shift_1.txt", "12 Sept 2025 Shift 1"),
    ("ssc-cgl-2025-12-september-2025-shift-2.txt", "02_SSC_CGL_2025_12_Sept_Shift_2.txt", "12 Sept 2025 Shift 2"),
    ("ssc-cgl-2025-12-september-2025-shift-3.txt", "03_SSC_CGL_2025_12_Sept_Shift_3.txt", "12 Sept 2025 Shift 3"),
    ("ssc-cgl-2025-13-september-2025-shift-1.txt", "04_SSC_CGL_2025_13_Sept_Shift_1.txt", "13 Sept 2025 Shift 1"),
    ("ssc-cgl-2025-13-september-2025-shift-2.txt", "05_SSC_CGL_2025_13_Sept_Shift_2.txt", "13 Sept 2025 Shift 2"),
    ("ssc-cgl-2025-13-september-2025-shift-3.txt", "06_SSC_CGL_2025_13_Sept_Shift_3.txt", "13 Sept 2025 Shift 3"),
    ("ssc-cgl-2025-14-september-2025-shift-1.txt", "07_SSC_CGL_2025_14_Sept_Shift_1.txt", "14 Sept 2025 Shift 1"),
    ("ssc-cgl-2025-14-september-2025-shift-2.txt", "08_SSC_CGL_2025_14_Sept_Shift_2.txt", "14 Sept 2025 Shift 2"),
    ("ssc-cgl-2025-14-september-2025-shift-3.txt", "09_SSC_CGL_2025_14_Sept_Shift_3.txt", "14 Sept 2025 Shift 3"),
    ("ssc-cgl-2025-15-september-2025-shift-1.txt", "10_SSC_CGL_2025_15_Sept_Shift_1.txt", "15 Sept 2025 Shift 1"),
    ("ssc-cgl-2025-15-september-2025-shift-2.txt", "11_SSC_CGL_2025_15_Sept_Shift_2.txt", "15 Sept 2025 Shift 2"),
    ("ssc-cgl-2025-15-september-2025-shift-3.txt", "12_SSC_CGL_2025_15_Sept_Shift_3.txt", "15 Sept 2025 Shift 3"),
]

readme_content = """================================================================================
SSC CGL 2025 TIER-I — ALL 12 OFFICIAL SHIFTS (VERIFIED & CLEANED)
================================================================================
Updated Date: 05 November 2026
Source: Official SSC CGL 2025 Answer Keys via SSC ZONE (www.ssczone.in)

INCLUDED PAPERS (100 MCQs Each = 1,200 Total Questions):
  01. SSC CGL 2025 (Held on 12 Sept 2025 Shift 1)
  02. SSC CGL 2025 (Held on 12 Sept 2025 Shift 2)
  03. SSC CGL 2025 (Held on 12 Sept 2025 Shift 3)
  04. SSC CGL 2025 (Held on 13 Sept 2025 Shift 1)
  05. SSC CGL 2025 (Held on 13 Sept 2025 Shift 2)
  06. SSC CGL 2025 (Held on 13 Sept 2025 Shift 3)
  07. SSC CGL 2025 (Held on 14 Sept 2025 Shift 1)
  08. SSC CGL 2025 (Held on 14 Sept 2025 Shift 2)
  09. SSC CGL 2025 (Held on 14 Sept 2025 Shift 3)
  10. SSC CGL 2025 (Held on 15 Sept 2025 Shift 1)
  11. SSC CGL 2025 (Held on 15 Sept 2025 Shift 2)
  12. SSC CGL 2025 (Held on 15 Sept 2025 Shift 3)

CORRECTIONS APPLIED IN THIS UPDATE:
  1. Removed Testbook OCR ghost strings & corrupted syllables across all shifts.
  2. Fixed missing plural bindis (संख्याओं, विकल्पों, कथनों, अक्षरों, शब्दों, छात्रों, दिनों, वर्षों).
  3. Fixed pronoun bindis (उन्हें, इन्होंने, उन्होंने, नहीं).
  4. Standardized spellings (शृंखला, संबंधित, उपर्युक्त, किए, लिए, गए, हुए).
  5. Fixed missing spaces between numbers and units (e.g., 300 किमी/घंटा).
================================================================================
"""

zip_filename = "SSC_CGL_2025_All_12_Shifts_Clean_Hindi_TXT.zip"
local_zip_path = os.path.join(r"c:\ssczone", zip_filename)
public_zip_path = os.path.join(r"c:\ssczone\public", zip_filename)
downloads_zip_path = os.path.join(r"C:\Users\Admin\Downloads", zip_filename)
e_zip_path = os.path.join(r"E:\pyq pdf", zip_filename)

with zipfile.ZipFile(local_zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    # Add Readme
    z.writestr("00_README_VERIFICATION_REPORT.txt", readme_content)
    
    for orig_fn, new_fn, label in papers_ordered:
        full_p = os.path.join(backup_dir, orig_fn)
        if os.path.exists(full_p):
            # Read text
            with open(full_p, "r", encoding="utf-8") as f:
                content = f.read()
            z.writestr(new_fn, content.encode("utf-8"))
            print(f"  ✓ Added {new_fn} ({len(content)} chars)")
        else:
            print(f"  ❌ Missing {orig_fn}")

print(f"\nLocal zip created at: {local_zip_path} ({os.path.getsize(local_zip_path)} bytes)")

# Copy to public folder
shutil.copy2(local_zip_path, public_zip_path)
print(f"  ✓ Copied to web public: {public_zip_path}")

# Copy to Downloads
shutil.copy2(local_zip_path, downloads_zip_path)
print(f"  ✓ Copied to Downloads: {downloads_zip_path}")

# Copy to E:
try:
    shutil.copy2(local_zip_path, e_zip_path)
    print(f"  ✓ Copied to E: drive: {e_zip_path}")
except Exception as e:
    print(f"  Note: E: drive copy skipped ({e})")

print("\nZIP generation completed successfully!")
