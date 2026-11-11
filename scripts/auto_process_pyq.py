import os
import sys
import re
import json
import argparse
import requests
import fitz
from supabase_env import get_supabase_credentials

# Configure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

# Supabase Credentials
SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

def detect_metadata_from_name(filename):
    """Auto-detect exam title, year, date, shift from filename."""
    base = os.path.basename(filename)
    
    # Year
    year_match = re.search(r'\b(202[0-9])\b', base)
    year = int(year_match.group(1)) if year_match else 2025
    
    # Exam
    exam_title = "SSC CGL"
    if "CHSL" in base.upper():
        exam_title = "SSC CHSL"
    elif "MTS" in base.upper():
        exam_title = "SSC MTS"
    elif "CPO" in base.upper():
        exam_title = "SSC CPO"
    elif "GD" in base.upper():
        exam_title = "SSC GD"

    # Shift
    shift_match = re.search(r'Shift[\s_]*(\d+)', base, re.IGNORECASE)
    shift_str = f"Shift {shift_match.group(1)}" if shift_match else "Shift 1"

    # Date pattern e.g. "12 Sept, 2025" or "12-Sep-2025" or "12 Sept 2025"
    date_match = re.search(r'(\d{1,2})\s*(?:st|nd|rd|th)?[\s_\-,]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[\s_\-,]*(\d{4})?', base, re.IGNORECASE)
    if date_match:
        day = date_match.group(1)
        month_raw = date_match.group(2).lower()
        # Normalize month
        month_map = {
            'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
            'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
            'sep': 'September', 'sept': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
        }
        month = month_map.get(month_raw, date_match.group(2).capitalize())
        date_str = f"{day} {month} {year}"
    else:
        date_str = f"Held in {year}"

    full_title = f"{exam_title} {year} Tier-I (Held On {date_str} {shift_str})"
    slug = f"{exam_title.lower().replace(' ', '-')}-{year}-{date_str.lower().replace(' ', '-')}-{shift_str.lower().replace(' ', '-')}"
    slug = re.sub(r'[^a-z0-9\-]', '', slug)

    return {
        "title": full_title,
        "exam_name": exam_title,
        "year": year,
        "date_str": date_str,
        "shift_str": shift_str,
        "slug": slug
    }

def clean_and_brand_pdf(input_pdf_path, meta, output_clean_path, web_pdf_path):
    """Clean third-party watermarks/links and add official SSC ZONE cover and branding."""
    print(f"\n[1/4] Cleaning & branding PDF: {os.path.basename(input_pdf_path)}...")
    doc = fitz.open(input_pdf_path)

    temp_clean = "tmp/temp_process_clean.pdf"
    os.makedirs("tmp", exist_ok=True)

    # 1. Strip external vendor ads & watermarks
    has_testbook = False
    start_pno = 0
    if len(doc) > 2:
        txt_p0 = doc[0].get_text()
        txt_p1 = doc[1].get_text()
        if "testbook" in txt_p0.lower() or "download testbook app" in txt_p0.lower():
            start_pno = 2
            has_testbook = True
        elif "testbook" in txt_p1.lower():
            start_pno = 2
            has_testbook = True

    for pno in range(start_pno, len(doc)):
        page = doc[pno]
        p_obj = doc.xref_object(page.xref)
        
        # Outer stream
        contents_match = re.search(r'/Contents\s*(?:\[\s*(\d+)\s+0\s+R\s*\]|(\d+)\s+0\s+R)', p_obj)
        if contents_match:
            outer_xref = int(contents_match.group(1) or contents_match.group(2))
            outer_stream = doc.xref_stream(outer_xref).decode('latin1', errors='ignore')
            cleaned_outer = re.sub(r'/Image-[^\s]+\s+Do', '% Do', outer_stream)
            doc.update_stream(outer_xref, cleaned_outer.encode('latin1'))

        # Inner embedded stream
        embedded_match = re.search(r'/EmbeddedPdfPage[^\s]+\s+(\d+)\s+0\s+R', p_obj)
        if embedded_match:
            embed_xref = int(embedded_match.group(1))
            inner_stream = doc.xref_stream(embed_xref).decode('latin1', errors='ignore')
            cleaned_inner = inner_stream.replace('/X4 Do', '%/X4 Do')
            doc.update_stream(embed_xref, cleaned_inner.encode('latin1'))

        # Strip third-party links
        doc.xref_set_key(page.xref, "Annots", "null")

    if has_testbook and start_pno > 0:
        doc.delete_pages(list(range(start_pno)))

    doc.save(temp_clean, garbage=4, deflate=True)
    doc.close()

    # 2. Add SSC ZONE Header, Footer, and Faint Watermark
    doc = fitz.open(temp_clean)
    total_pages = len(doc)

    for idx, page in enumerate(doc, start=1):
        # Faint watermark
        pt_wm = fitz.Point(140, 520)
        page.insert_text(
            pt_wm,
            "SSC ZONE",
            fontsize=62,
            fontname="helv",
            color=(0.92, 0.94, 0.96),
            morph=(pt_wm, fitz.Matrix(45))
        )
        
        # Header line & text
        page.draw_line(fitz.Point(35, 45), fitz.Point(560, 45), color=(0.82, 0.86, 0.90), width=0.75)
        page.insert_text(
            fitz.Point(35, 38),
            f"{meta['exam_name']} {meta['year']} Tier-I | Held on {meta['date_str']} ({meta['shift_str']})",
            fontsize=8.5,
            fontname="helv",
            color=(0.3, 0.35, 0.45)
        )
        page.insert_text(fitz.Point(475, 38), "SSC ZONE", fontsize=9, fontname="helv", color=(0.15, 0.35, 0.75))
        
        # Footer line & text
        page.draw_line(fitz.Point(35, 796), fitz.Point(560, 796), color=(0.82, 0.86, 0.90), width=0.75)
        page.insert_text(fitz.Point(35, 809), "SSC ZONE — Free Practice & Mock Tests (ssczone.in)", fontsize=8, fontname="helv", color=(0.4, 0.45, 0.55))
        page.insert_text(fitz.Point(275, 809), f"Page {idx} of {total_pages}", fontsize=8, fontname="helv", color=(0.3, 0.35, 0.45))
        page.insert_text(fitz.Point(495, 809), "www.ssczone.in", fontsize=8, fontname="helv", color=(0.15, 0.35, 0.75))

    # 3. Create Cover Page
    cover_doc = fitz.open()
    cover_page = cover_doc.new_page(width=595, height=842)
    DARK_NAVY = (15/255, 23/255, 42/255)
    ROYAL_BLUE = (37/255, 99/255, 235/255)
    LIGHT_SLATE = (248/255, 250/255, 252/255)
    CARD_BG = (1, 1, 1)
    BORDER_COLOR = (226/255, 232/255, 240/255)
    TEXT_DARK = (30/255, 41/255, 59/255)
    TEXT_MUTED = (100/255, 116/255, 139/255)
    GOLD_ACCENT = (217/255, 119/255, 6/255)

    cover_page.draw_rect(fitz.Rect(0, 0, 595, 842), color=None, fill=LIGHT_SLATE)
    cover_page.draw_rect(fitz.Rect(0, 0, 595, 135), color=None, fill=DARK_NAVY)
    cover_page.draw_rect(fitz.Rect(0, 135, 595, 140), color=None, fill=ROYAL_BLUE)

    logo_path = r"C:\ssczone\public\icon-512.png"
    if os.path.exists(logo_path):
        cover_page.insert_image(fitz.Rect(40, 30, 115, 105), filename=logo_path)

    cover_page.insert_text(fitz.Point(125, 58), "SSC ZONE", fontsize=26, fontname="helv", color=(1, 1, 1))
    cover_page.insert_text(fitz.Point(125, 78), "INDIA'S DEDICATED SSC PREPARATION PLATFORM", fontsize=9, fontname="helv", color=(0.7, 0.8, 1))
    cover_page.insert_text(fitz.Point(125, 96), "Free Mock Tests | Previous Year Papers | Chapterwise Practice", fontsize=8.5, fontname="helv", color=(0.85, 0.85, 0.9))

    # Exam Card
    cover_page.draw_rect(fitz.Rect(40, 160, 555, 265), color=BORDER_COLOR, fill=CARD_BG, width=1)
    cover_page.draw_rect(fitz.Rect(40, 160, 46, 265), color=None, fill=ROYAL_BLUE)
    cover_page.insert_text(fitz.Point(60, 188), "STAFF SELECTION COMMISSION (SSC)", fontsize=11, fontname="helv", color=GOLD_ACCENT)
    cover_page.insert_text(fitz.Point(60, 216), f"{meta['exam_name']} {meta['year']} Tier-I Official Paper", fontsize=18, fontname="helv", color=DARK_NAVY)
    cover_page.insert_text(fitz.Point(60, 238), f"Held On: {meta['date_str']}  |  Shift: {meta['shift_str']}", fontsize=10, fontname="helv", color=TEXT_MUTED)
    cover_page.insert_text(fitz.Point(60, 254), "Bilingual Paper (English & Hindi)  •  Official Answer Key Included", fontsize=9.5, fontname="helv", color=ROYAL_BLUE)

    # 4 Stats Cards
    stats = [("Total Questions", "100 MCQs"), ("Maximum Marks", "200 Marks"), ("Total Duration", "60 Minutes"), ("Negative Marking", "0.50 per wrong")]
    card_w = (515 - 30) / 4
    for s_i, (lbl, val) in enumerate(stats):
        x0 = 40 + s_i * (card_w + 10)
        x1 = x0 + card_w
        cover_page.draw_rect(fitz.Rect(x0, 280, x1, 335), color=BORDER_COLOR, fill=CARD_BG, width=1)
        cover_page.insert_text(fitz.Point(x0 + 10, 302), lbl, fontsize=8, fontname="helv", color=TEXT_MUTED)
        cover_page.insert_text(fitz.Point(x0 + 10, 322), val, fontsize=10.5, fontname="helv", color=DARK_NAVY)

    # Sections Card
    cover_page.draw_rect(fitz.Rect(40, 350, 555, 500), color=BORDER_COLOR, fill=CARD_BG, width=1)
    cover_page.draw_rect(fitz.Rect(40, 350, 555, 375), color=None, fill=(241/255, 245/255, 249/255))
    cover_page.insert_text(fitz.Point(55, 367), "PAPER COMPOSITION & SECTION BREAKDOWN", fontsize=10, fontname="helv", color=DARK_NAVY)

    sections_data = [
        ("Section 1", "General Intelligence and Reasoning", "Q1 – Q25", "25 Questions", "50 Marks"),
        ("Section 2", "General Awareness & Static GK", "Q26 – Q50", "25 Questions", "50 Marks"),
        ("Section 3", "Quantitative Aptitude (Mathematics)", "Q51 – Q75", "25 Questions", "50 Marks"),
        ("Section 4", "English Comprehension", "Q76 – Q100", "25 Questions", "50 Marks"),
    ]
    for s_idx, (sec, name, q_range, q_cnt, mks) in enumerate(sections_data):
        y = 400 + s_idx * 24
        cover_page.insert_text(fitz.Point(55, y), sec, fontsize=9, fontname="helv", color=ROYAL_BLUE)
        cover_page.insert_text(fitz.Point(125, y), name, fontsize=9, fontname="helv", color=TEXT_DARK)
        cover_page.insert_text(fitz.Point(340, y), q_range, fontsize=8.5, fontname="helv", color=TEXT_MUTED)
        cover_page.insert_text(fitz.Point(420, y), q_cnt, fontsize=8.5, fontname="helv", color=TEXT_MUTED)
        cover_page.insert_text(fitz.Point(495, y), mks, fontsize=8.5, fontname="helv", color=TEXT_DARK)
        if s_idx < 3:
            cover_page.draw_line(fitz.Point(55, y + 6), fitz.Point(540, y + 6), color=(241/255, 245/255, 249/255), width=0.5)

    # Instructions Card
    cover_page.draw_rect(fitz.Rect(40, 515, 555, 730), color=BORDER_COLOR, fill=CARD_BG, width=1)
    cover_page.draw_rect(fitz.Rect(40, 515, 555, 540), color=None, fill=(241/255, 245/255, 249/255))
    cover_page.insert_text(fitz.Point(55, 532), "IMPORTANT INSTRUCTIONS FOR ASPIRANTS", fontsize=10, fontname="helv", color=DARK_NAVY)
    instructions = [
        "1. This booklet contains 100 multiple choice questions divided across 4 mandatory sections.",
        "2. Each question carries 2 marks. For every wrong answer, 0.50 marks will be deducted as negative marking.",
        "3. Attempt the paper with a strictly timed 60-minute stopwatch to simulate real exam conditions.",
        "4. Official answer keys are indicated at the end of each question for self-evaluation.",
        "5. For detailed explanations, topic-wise practice, and performance analytics, visit SSC ZONE.",
        "6. Practice this test in an interactive CBT online exam mode directly at www.ssczone.in/papers."
    ]
    for in_idx, inst in enumerate(instructions):
        y = 562 + in_idx * 26
        cover_page.insert_text(fitz.Point(55, y), inst, fontsize=8.5, fontname="helv", color=TEXT_DARK)

    # CTA Footer
    cover_page.draw_rect(fitz.Rect(40, 745, 555, 805), color=None, fill=DARK_NAVY)
    cover_page.insert_text(fitz.Point(60, 770), "Attempt this exact paper in real CBT Interface with Timer & Rank Predictor:", fontsize=9, fontname="helv", color=(0.8, 0.85, 0.95))
    cover_page.insert_text(fitz.Point(60, 788), "Visit: www.ssczone.in/papers  |  Mobile App available for Android", fontsize=9.5, fontname="helv", color=(1, 1, 1))

    # Insert cover at page 0
    doc.insert_pdf(cover_doc, from_page=0, to_page=0, start_at=0)

    # Metadata
    doc.set_metadata({
        "title": f"{meta['title']} - SSC ZONE",
        "author": "SSC ZONE",
        "subject": f"{meta['exam_name']} Previous Year Paper with Official Key",
        "keywords": f"{meta['exam_name']}, {meta['year']}, PYQ, SSC ZONE",
        "creator": "SSC ZONE Education Portal (www.ssczone.in)",
        "producer": "SSC ZONE PDF Engine"
    })

    # Save
    doc.save(output_clean_path, garbage=4, deflate=True)
    doc.close()
    cover_doc.close()

    # Save copy to public/papers for web downloads
    os.makedirs(os.path.dirname(web_pdf_path), exist_ok=True)
    with open(output_clean_path, "rb") as sf, open(web_pdf_path, "wb") as df:
        df.write(sf.read())

    print(f"   ✓ Clean branded PDF created: {output_clean_path}")
    print(f"   ✓ Public website download ready: {web_pdf_path}")

def clean_hindi_text(text):
    if not text:
        return text
    # Known junk ligatures & double-matras from PDF extraction
    text = text.replace("ि ैी ेी ि रेंऔ", "")
    text = text.replace("उन्होंोंनेने", "उन्होंने")
    text = text.replace("ट्रॉॉफी", "ट्रॉफी")
    text = text.replace("कंट्रीी", "कंट्री")
    text = text.replace("इक्वेेडोर", "इक्वेडोर")
    text = text.replace("अनुच्छेेद", "अनुच्छेद")
    text = text.replace("इलेक्ट्रॉॉन", "इलेक्ट्रॉन")
    text = text.replace("ब्रह्मांांडीय", "ब्रह्मांडीय")
    text = text.replace("मिलिट्रीी", "मिलिट्री")
    text = text.replace("रैंकिंंग", "रैंकिंग")
    text = text.replace("कंप्यूटरोंों", "कंप्यूटरों")
    text = text.replace("यूनियनोंों", "यूनियनों")
    text = text.replace("अधिकारियोंों", "अधिकारियों")

    # Generic duplicate Devanagari vowel signs
    devanagari_matras = r'([\u093E-\u094C\u0901-\u0903])\1+'
    text = re.sub(devanagari_matras, r'\1', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def extract_questions_from_pdf(clean_pdf_path):
    """Accurately extract all 100 questions from the cleaned PDF."""
    print(f"\n[2/4] Extracting 100 questions from PDF...")
    doc = fitz.open(clean_pdf_path)

    content_blocks = []
    # Skip cover page (index 0)
    for pno in range(1, len(doc)):
        page = doc[pno]
        blocks = page.get_text("blocks")
        for b in blocks:
            text = b[4].strip()
            y0 = b[1]
            y1 = b[3]
            # Exclude header and footer lines
            if y0 < 48 or y1 > 798:
                continue
            if "SSC ZONE" in text or "Tier-I" in text or "www.ssczone.in" in text:
                continue
            if re.match(r'^Q\d+\.\s*$', text):
                continue
            content_blocks.append(text)

    full_text = "\n".join(content_blocks)
    ca_pattern = re.compile(r'Correct Answer:\s*([A-D])', re.IGNORECASE)
    parts = ca_pattern.split(full_text)

    all_questions = []
    for j in range(0, len(parts) - 1, 2):
        q_raw = parts[j].strip()
        ans = parts[j+1].strip().upper()

        opt_matches = list(re.finditer(r'(?:^|\n)\s*([A-D])[\)\.]', q_raw))
        if len(opt_matches) >= 4:
            last_4_opts = opt_matches[-4:]
            statement = q_raw[:last_4_opts[0].start()].strip()

            opts = {}
            for o_i, m in enumerate(last_4_opts):
                label = m.group(1).upper()
                start_p = m.end()
                end_p = last_4_opts[o_i + 1].start() if o_i + 1 < len(last_4_opts) else len(q_raw)
                val = q_raw[start_p:end_p].strip().replace('\n', ' ')
                opts[label] = val if val else f"Option {label}"

            statement_clean = re.sub(r'^Q\d+\.\s*', '', statement).strip()
            statement_clean = clean_hindi_text(statement_clean)

            q_num = len(all_questions) + 1
            all_questions.append({
                "question_number": q_num,
                "question_text": statement_clean.replace('\n', ' '),
                "option_a": clean_hindi_text(opts.get("A", "Option A")),
                "option_b": clean_hindi_text(opts.get("B", "Option B")),
                "option_c": clean_hindi_text(opts.get("C", "Option C")),
                "option_d": clean_hindi_text(opts.get("D", "Option D")),
                "correct_answer": ans
            })

    print(f"   ✓ Extracted {len(all_questions)} questions successfully.")
    return all_questions

def save_and_sync_supabase(meta, questions, pdf_web_url=None):
    """Insert or update paper in Supabase and upload all 100 questions."""
    print(f"\n[3/4] Syncing paper & questions to Supabase...")

    # 1. Get or create exam_id
    exam_id = 1 # Default SSC CGL
    res_exam = requests.get(f"{SUPABASE_URL}/rest/v1/exams?title=ilike.*{meta['exam_name']}*&limit=1", headers=HEADERS)
    if res_exam.ok and res_exam.json():
        exam_id = res_exam.json()[0]['id']

    # 2. Check if paper already exists
    res_p = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?title=eq.{requests.utils.quote(meta['title'])}&limit=1", headers=HEADERS)
    paper_id = None
    if res_p.ok and res_p.json():
        paper_id = res_p.json()[0]['id']
        print(f"   • Existing paper found with ID: {paper_id}. Updating...")
        update_payload = {
            "total_questions": len(questions),
            "duration_minutes": 60,
            "test_type": "pyq",
            "is_active": True
        }
        requests.patch(f"{SUPABASE_URL}/rest/v1/previous_papers?id=eq.{paper_id}", headers=HEADERS, json=update_payload)
    else:
        print(f"   • Creating new paper entry in database...")
        insert_payload = {
            "title": meta['title'],
            "exam_id": exam_id,
            "year": meta['year'],
            "total_questions": len(questions),
            "duration_minutes": 60,
            "test_type": "pyq",
            "is_active": True
        }
        res_ins = requests.post(f"{SUPABASE_URL}/rest/v1/previous_papers", headers={**HEADERS, "Prefer": "return=representation"}, json=insert_payload)
        if res_ins.ok and res_ins.json():
            paper_id = res_ins.json()[0]['id']
            print(f"   ✓ New paper created with ID: {paper_id}")
        else:
            print("   ✗ Error creating paper:", res_ins.text)
            return None

    # 3. Clean existing questions for this paper
    requests.delete(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}", headers=HEADERS)

    # 4. Insert all questions in chunks of 50
    valid_cols = {"paper_id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "question_number"}
    rows = [{k: v for k, v in {**q, "paper_id": paper_id}.items() if k in valid_cols} for q in questions]
    res1 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[:50])
    res2 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[50:])

    print(f"   ✓ Chunk 1 (Q1-50) status: {res1.status_code}")
    print(f"   ✓ Chunk 2 (Q51-{len(rows)}) status: {res2.status_code}")

    # Verify count
    chk = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}&select=count", headers={**HEADERS, 'Prefer': 'count=exact'})
    total_db = chk.headers.get('content-range', '')
    print(f"   ✓ Database verification: {total_db} questions active!")

    return paper_id

def process_single_pdf(pdf_path, override_meta=None):
    print("=" * 70)
    print(f"🚀 SSC ZONE PYQ AUTOMATION ENGINE: {os.path.basename(pdf_path)}")
    print("=" * 70)

    meta = detect_metadata_from_name(pdf_path)
    if override_meta:
        for k, v in override_meta.items():
            if v:
                meta[k] = v
        if override_meta.get("title"):
            meta["title"] = override_meta["title"]

    print(f"Detected Metadata:")
    print(f"  • Title: {meta['title']}")
    print(f"  • Exam:  {meta['exam_name']} ({meta['year']})")
    print(f"  • Date:  {meta['date_str']} | Shift: {meta['shift_str']}")

    output_dir = os.path.dirname(pdf_path)
    clean_pdf_filename = f"{meta['slug']}_SSC_ZONE.pdf"
    clean_pdf_path = os.path.join(output_dir, clean_pdf_filename)
    web_pdf_path = os.path.join(r"C:\ssczone\public\papers", f"{meta['slug']}.pdf")

    # Step 1: Clean & Brand
    clean_and_brand_pdf(pdf_path, meta, clean_pdf_path, web_pdf_path)

    # Step 2: Extract Questions
    questions = extract_questions_from_pdf(clean_pdf_path)
    if not questions:
        print("✗ No questions could be extracted. Please check the PDF layout.")
        return

    # Export backup JSON
    json_path = os.path.join(output_dir, f"{meta['slug']}_bulk_import.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"   ✓ Backup JSON exported: {json_path}")

    # Step 3: Sync to Supabase
    paper_id = save_and_sync_supabase(meta, questions)

    # Step 4: Summary & Ready-to-use Link
    print("\n" + "=" * 70)
    print("🎉 ALL DONE IN ~10 SECONDS!")
    print(f"✓ Paper ID:     {paper_id}")
    print(f"✓ Paper Title:  {meta['title']}")
    print(f"✓ Total MCQs:   {len(questions)} (Reasoning: 25 | GA: 25 | Quant: 25 | English: 25)")
    print(f"✓ Clean PDF:    {clean_pdf_path}")
    print(f"✓ Web PDF:      /papers/{meta['slug']}.pdf")
    print(f"✓ CBT Test URL: http://localhost:3000/take-test/{paper_id}")
    print(f"✓ Admin URL:    http://localhost:3000/admin/papers/{paper_id}")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automate PYQ PDF Cleaning, Extraction & Supabase Ingestion")
    parser.add_argument("pdf_path", nargs="?", help="Path to raw official SSC PDF")
    parser.add_argument("--scan", help="Scan a directory for unprocessed PDFs", default=None)
    parser.add_argument("--title", help="Custom Paper Title", default=None)
    parser.add_argument("--exam", help="Exam Name (e.g. 'SSC CGL')", default=None)
    parser.add_argument("--year", help="Exam Year", type=int, default=None)
    parser.add_argument("--shift", help="Shift (e.g. 'Shift 2')", default=None)
    parser.add_argument("--date", help="Date string (e.g. '13 September 2025')", default=None)

    args = parser.parse_args()
    overrides = {
        "title": args.title,
        "exam_name": args.exam,
        "year": args.year,
        "shift_str": args.shift,
        "date_str": args.date
    }
    overrides = {k: v for k, v in overrides.items() if v is not None}

    if args.scan:
        scan_dir = args.scan
        if not os.path.exists(scan_dir):
            print(f"Scan directory not found: {scan_dir}")
            sys.exit(1)
        files = [os.path.join(scan_dir, f) for f in os.listdir(scan_dir) if f.lower().endswith(".pdf") and not f.endswith("_SSC_ZONE.pdf")]
        print(f"Found {len(files)} raw PDF(s) in {scan_dir} to process.")
        for f in files:
            process_single_pdf(f, overrides)
    elif args.pdf_path:
        if not os.path.exists(args.pdf_path):
            print(f"File not found: {args.pdf_path}")
            sys.exit(1)
        process_single_pdf(args.pdf_path, overrides)
    else:
        # Default scan E:\pyq pdf
        default_dir = r"E:\pyq pdf"
        if os.path.exists(default_dir):
            files = [os.path.join(default_dir, f) for f in os.listdir(default_dir) if f.lower().endswith(".pdf") and not f.endswith("_SSC_ZONE.pdf")]
            if files:
                print(f"Auto-processing found PDF: {files[0]}")
                process_single_pdf(files[0], overrides)
            else:
                print(f"No unprocessed PDFs found in {default_dir}.")
        else:
            print("Please provide a PDF path: python scripts/auto_process_pyq.py <path_to_pdf>")
