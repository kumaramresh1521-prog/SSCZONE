import os
import glob
import json
import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load Supabase credentials
env = {}
with open(r'c:\ssczone\.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Fetch all papers from previous_papers for year=2026
resp = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?year=eq.2026&select=id,title,year&order=id.asc", headers=HEADERS)
db_papers = resp.json()
print(f"Total 2026 papers in DB: {len(db_papers)}")

# List local JSONs
json_files = sorted(glob.glob(r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-*.json'))
print(f"Total local JSON files: {len(json_files)}")

# List PDFs on F: drive
f_drive_dir = r'F:\startup  send mail\2026'
pdf_files = sorted(glob.glob(os.path.join(f_drive_dir, '*.pdf')))
print(f"Total PDFs on F: drive: {len(pdf_files)}")

print("\n--- Mapping Papers ---")
for idx, jf in enumerate(json_files):
    base = os.path.basename(jf).replace('.json', '')
    # Match with db_paper
    matched_db = None
    for p in db_papers:
        # e.g. title contains date and shift
        # create normalized string
        p_title_clean = p['title'].lower().replace('held on', '').replace(':', '').replace('_', ' ')
        # check parts
        if str(p['id']) == str(25 + idx): # sequential default
            matched_db = p
            break
    
    # Match PDF
    # Find PDF that has same date and shift
    # parse base: ssc-cgl-2026-12-october-2026-shift-3
    matched_pdf = None
    parts = base.split('-')
    # parts: ['ssc', 'cgl', '2026', '12', 'october', '2026', 'shift', '3']
    # extract day, month, shift
    day = None
    month = None
    shift = None
    for i, part in enumerate(parts):
        if part in ['september', 'october']:
            month = part
            day = parts[i-1]
        if part == 'shift' and i + 1 < len(parts):
            shift = parts[i+1]
            
    for pdf in pdf_files:
        p_lower = os.path.basename(pdf).lower()
        if f"{day} {month[:3]}" in p_lower and f"shift {shift}" in p_lower:
            matched_pdf = pdf
            break
        elif f"{day} {month}" in p_lower and f"shift {shift}" in p_lower:
            matched_pdf = pdf
            break
            
    print(f"[{idx+1:02d}] {base} -> DB ID: {matched_db['id'] if matched_db else 'N/A'} | PDF: {os.path.basename(matched_pdf) if matched_pdf else 'MISSING'}")
