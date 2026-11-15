"""
Script to extract, crop figures, and ingest all 293 Paper Cutting & Folding questions
into Supabase 'questions' table under topic_id 247 ('Paper Folding and Cutting').
"""

import os
import sys
import re
import json
import time
import requests
import fitz
from PIL import Image
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from scripts.supabase_env import get_supabase_credentials
except ImportError:
    from supabase_env import get_supabase_credentials

PDF_PATH = r"C:\Users\Admin\.gemini\antigravity\brain\a4f88990-1ffd-4462-a906-52e3447e1c0c\.user_uploaded\media_1794745293259_05e45098.pdf"
IMAGES_DIR = os.path.join("public", "images", "questions", "paper_folding")
os.makedirs(IMAGES_DIR, exist_ok=True)

SEP_LINE_REGEX = re.compile(r'^\s*(?:\([a-z\s]+\)\s*)?(?:\d+\.\s*)?(?:Questions?|Problem|Unfolded\s*Paper)\s*Figures?\s*[:\.]?\s*$', re.I)

def parse_answer_key(doc):
    key_page = doc[293] # Page 294
    text = key_page.get_text()
    matches = re.findall(r'(\d+)\.\s*\(([1-4])(?:\s*or\s*[1-4])?\*?\)', text)
    answer_map = {}
    for q, a in matches:
        answer_map[int(q)] = int(a)
    print(f"[Key] Parsed {len(answer_map)} answers from page 294.")
    return answer_map

def process_single_question(doc, q_num, answer_map, dry_run=False):
    pno = q_num - 1
    page = doc[pno]
    td = page.get_text('dict')
    
    lines = []
    source_str = ''
    source_y0 = 780.0
    
    for b in td['blocks']:
        if 'lines' in b:
            for l in b['lines']:
                lt = ''.join(s['text'] for s in l['spans']).strip()
                bbox = l['bbox']
                if 'source:' in lt.lower() or bbox[1] >= 780:
                    source_str = lt
                    source_y0 = min(source_y0, bbox[1])
                elif bbox[3] > 55 and bbox[1] < 780:
                    lines.append((bbox, lt))
                    
    # Find separator line e.g. "Question Figures :"
    sep_idx = None
    for idx, (bbox, lt) in enumerate(lines):
        if SEP_LINE_REGEX.match(lt):
            sep_idx = idx
            break
            
    if sep_idx is not None:
        p_lines = lines[:sep_idx]
        fig_start_y = lines[sep_idx][0][1] # clean top of separator line
    else:
        # Check if any line ends the prompt sentence
        end_idx = None
        for idx, (bbox, lt) in enumerate(lines):
            if re.search(r'(?:opened[\.\?]|given[\.\?]|below[\.\?]|response[\.\?]|figures?[\.\?]|responses[\.\?])$', lt, re.I):
                end_idx = idx
                break
        if end_idx is not None:
            p_lines = lines[:end_idx+1]
            fig_start_y = lines[end_idx][0][3] + 3
        else:
            first_opt_idx = None
            for idx, (bbox, lt) in enumerate(lines):
                if re.match(r'^\(1\)', lt):
                    first_opt_idx = idx
                    break
            p_lines = lines[:first_opt_idx] if first_opt_idx else lines[:1]
            fig_start_y = p_lines[-1][0][3] + 3 if p_lines else 60.0
            
    prompt_str = ' '.join(lt for bbox, lt in p_lines).strip()
    clean_prompt = re.sub(r'^(?:Q\.\s*\d+\s*)?(?:\([a-z\s]+\)\s*)?\d+\.\s*', '', prompt_str)
    # De-hyphenate line breaks like 'ques- tion' -> 'question', 'fold- ed' -> 'folded'
    clean_prompt = re.sub(r'(\b\w+)-\s+(\w+\b)', r'\1\2', clean_prompt)
    clean_prompt = re.sub(r'\s+', ' ', clean_prompt).strip()
    
    clean_source = re.sub(r'^Source:\s*\(?', '', source_str, flags=re.I).rstrip(')')
    if not clean_source:
        clean_source = "SSC Previous Year Exam"
        
    ans_digit = answer_map.get(q_num, 1)
    digit_to_opt = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}
    correct_ans = digit_to_opt[ans_digit]
    
    # Generate cropped figure
    out_filename = f"q_{q_num}.png"
    out_path = os.path.join(IMAGES_DIR, out_filename)
    rel_url = f"/images/questions/paper_folding/{out_filename}"
    
    if not dry_run:
        pix = page.get_pixmap(dpi=150)
        img = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
        gray = img.convert('L')
        arr = np.array(gray)
        
        scale = 150.0 / 72.0
        top_px = int(max(0, fig_start_y * scale))
        bot_px = int(min(img.height, (source_y0 - 4) * scale))
        
        slice_arr = arr[top_px:bot_px, :]
        non_white = (slice_arr < 240)
        rows = np.where(non_white.any(axis=1))[0]
        cols = np.where(non_white.any(axis=0))[0]
        
        if len(rows) > 0 and len(cols) > 0:
            actual_top = max(0, top_px + rows[0] - 10)
            actual_bot = min(img.height, top_px + rows[-1] + 10)
            actual_left = max(0, cols[0] - 10)
            actual_right = min(img.width, cols[-1] + 10)
            cropped = img.crop((actual_left, actual_top, actual_right, actual_bot))
        else:
            cropped = img.crop((0, top_px, img.width, bot_px))
            
        cropped.save(out_path, optimize=True)
        
    # Explanation
    if q_num == 161:
        expl = "According to official answer key and paper folding symmetry, Option B (Figure 2) is correct. Note: Source book notes that cube properties also closely resemble Figure 3."
    else:
        expl = f"According to the folding pattern and unfolding symmetry, Figure ({ans_digit}) [Option {correct_ans}] is the correct unfolded paper representation."
        
    record = {
        "topic_id": 247,
        "question_text": clean_prompt,
        "option_a": "Figure (1)",
        "option_b": "Figure (2)",
        "option_c": "Figure (3)",
        "option_d": "Figure (4)",
        "correct_answer": correct_ans,
        "explanation": expl,
        "image_url": rel_url,
        "exam_tag": clean_source,
        "difficulty": "medium",
        "is_active": True
    }
    return record

def main():
    print(f"Opening PDF: {PDF_PATH}")
    doc = fitz.open(PDF_PATH)
    answer_map = parse_answer_key(doc)
    
    all_records = []
    print("Processing all 293 questions and cropping high-res diagrams...")
    start_time = time.time()
    
    for q_num in range(1, 294):
        rec = process_single_question(doc, q_num, answer_map, dry_run=False)
        all_records.append(rec)
        if q_num % 50 == 0 or q_num == 293:
            elapsed = time.time() - start_time
            pct = int((q_num / 293) * 100)
            print(f"[{pct}%] Processed {q_num}/293 questions in {elapsed:.1f}s")
            
    json_path = os.path.join("scripts", "paper_folding_293.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_records, f, indent=2, ensure_ascii=False)
    print(f"Saved extracted data to {json_path}")
    
    # Now ingest into Supabase
    url, key = get_supabase_credentials()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    print("\nStarting insertion into Supabase 'questions' table...")
    batch_size = 50
    inserted_total = 0
    
    for i in range(0, len(all_records), batch_size):
        batch = all_records[i:i+batch_size]
        resp = requests.post(f"{url}/rest/v1/questions", headers=headers, json=batch)
        if resp.status_code in [200, 201]:
            inserted_count = len(resp.json())
            inserted_total += inserted_count
            pct = int((inserted_total / 293) * 100)
            print(f"[{pct}%] Batch {i//batch_size + 1}: Inserted {inserted_count} questions. Total inserted: {inserted_total}/293")
        else:
            print(f"Error in batch {i//batch_size + 1}: {resp.status_code} {resp.text}")
            break
            
    print(f"\nIngestion Complete! Total inserted: {inserted_total} / 293 questions.")

if __name__ == "__main__":
    main()
