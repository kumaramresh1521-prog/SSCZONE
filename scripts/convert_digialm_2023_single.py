import argparse
import gc
import json
import os
import re
import shutil
import sys
import time
from datetime import datetime

import fitz
import numpy as np
import requests
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = r"c:\ssczone"
SCRIPTS_DIR = os.path.join(REPO_ROOT, "scripts")
HI_OVERRIDES_PATH = os.path.join(SCRIPTS_DIR, "hi_overrides_2023.json")
EN_OVERRIDES_PATH = os.path.join(SCRIPTS_DIR, "en_overrides_2023.json")
MANIFEST_PATH = os.path.join(SCRIPTS_DIR, "manifest_2023.json")

sys.path.insert(0, SCRIPTS_DIR)
import convert_digialm_2024_single as c24
import typeb_2023_engine as tb

TICK_SIZES = {(21, 21), (21, 22), (22, 22), (23, 23), (16, 16)}
CROSS_SIZES = {(31, 21)}
ICON_SIZES = TICK_SIZES | CROSS_SIZES
NON_CONTENT_SIZES = {
    (1274, 1650), (1275, 1650), (1882, 3700), (1883, 3700),
    (138, 130), (198, 130), (1275, 1651), (1276, 1650),
}

SECTION_ORDER = [
    ("General Intelligence and Reasoning", 0),
    ("General Awareness", 25),
    ("Quantitative Aptitude", 50),
    ("English Comprehension", 75),
]

def load_hi_overrides():
    if os.path.exists(EN_OVERRIDES_PATH):
        with open(EN_OVERRIDES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    if os.path.exists(HI_OVERRIDES_PATH):
        with open(HI_OVERRIDES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def load_manifest():
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return {r["file"]: r for r in json.load(f)}
    return {}

def is_colored_opt_label(colors):
    for c in colors:
        if c in ("#40c64b", "#f61818", "#e61616", "#37ac3f"):
            return True
        if c.startswith("#") and len(c) == 7:
            try:
                r = int(c[1:3], 16)
                g = int(c[3:5], 16)
                if (r > 150 and g < 100) or (g > 120 and r < 100):
                    return True
            except ValueError:
                pass
    return False

def split_q_marker_spans(line):
    raw_spans = [s for s in line["spans"] if s["text"]]
    non_ws = [(idx, s) for idx, s in enumerate(raw_spans) if s["text"].strip()]
    if len(non_ws) >= 2:
        _, s0 = non_ws[0]
        idx1, s1 = non_ws[1]
        t0 = s0["text"].strip()
        if re.match(r"^Q\.\d+$", t0):
            gap = s1["bbox"][0] - s0["bbox"][2]
            if gap >= 2.0:
                l1 = {"bbox": s0["bbox"], "spans": [s0]}
                rem = raw_spans[idx1:]
                bx0 = min(s["bbox"][0] for s in rem)
                by0 = min(s["bbox"][1] for s in rem)
                bx1 = max(s["bbox"][2] for s in rem)
                by1 = max(s["bbox"][3] for s in rem)
                l2 = {"bbox": (bx0, by0, bx1, by1), "spans": rem}
                return [l1, l2]
    return [line]

def get_metadata_for_pdf(pdf_path):
    bn = os.path.basename(pdf_path)
    manifest = load_manifest()
    
    # Try exact match or by title
    for m in manifest.values():
        if m["file"] == bn or m["pdf_filename"] == bn:
            return m

    # Dynamic fallback
    doc = fitz.open(pdf_path)
    p0_top = doc[0].get_text("text", clip=fitz.Rect(0, 0, doc[0].rect.width, 220))
    p1_txt = len(doc[1].get_text("text").strip())
    doc_type = "A" if p1_txt > 50 else "B"

    m_banner = re.search(r"(Combined Graduate Level Examination[^\n]+)", p0_top)
    m_date = re.search(r"\b(\d{1,2}/\d{2}/\d{4})\b", p0_top)
    m_time = re.search(r"(\d{1,2}\s*:\s*\d{2}\s*[AP]M\s*-\s*\d{1,2}\s*:\s*\d{2}\s*[AP]M)", p0_top, re.I)

    exam_date = m_date.group(1).strip() if m_date else ""
    exam_time = m_time.group(1).strip() if m_time else ""

    if exam_date.startswith("0/"): exam_date = "20/" + exam_date[2:]
    elif exam_date.startswith("4/"): exam_date = "24/" + exam_date[2:]
    elif exam_date.startswith("1/"): exam_date = "21/" + exam_date[2:]

    t_norm = exam_time.upper().replace(" ", "")
    if t_norm.startswith("9:") or t_norm.startswith("09:"): shift = 1
    elif t_norm.startswith("11:45") or t_norm.startswith("11:"): shift = 2
    elif t_norm.startswith("2:30") or t_norm.startswith("02:30") or "23:30" in t_norm: shift = 3
    elif t_norm.startswith("5:15") or t_norm.startswith("05:15"): shift = 4
    else: raise ValueError(f"Unrecognized Exam Time '{exam_time}'")

    dt = datetime.strptime(exam_date, "%d/%m/%Y")
    day = str(dt.day)
    month_full = dt.strftime("%B")
    year = dt.year

    doc.close()
    slug = f"ssc-cgl-{year}-{day}-{month_full.lower()}-{year}-shift-{shift}"
    db_title = f"SSC CGL {year} Tier-I (Held On {day} {month_full} {year} Shift {shift})"
    pdf_filename = f"SSC CGL {year} Tier-I (Held On {day} {month_full} {year} Shift {shift}).pdf"

    return {
        "file": bn,
        "type": doc_type,
        "date": exam_date,
        "time": exam_time,
        "shift": shift,
        "slug": slug,
        "db_title": db_title,
        "pdf_filename": pdf_filename,
    }

def extract_type_a_pdf(pdf_path, meta, img_out_dir, write_images=False):
    doc = fitz.open(pdf_path)
    stream = []
    saved_images = []
    sec_x0s = []
    hi_overrides = load_hi_overrides()

    for pno, page in enumerate(doc):
        underlines = c24.extract_underlines(page, pno)

        seen_bboxes = []
        raw_imgs = [
            inf for inf in page.get_image_info(xrefs=True)
            if (inf["width"], inf["height"]) not in ICON_SIZES
            and (inf["width"], inf["height"]) not in NON_CONTENT_SIZES
            and inf["width"] < 1200 and inf["height"] < 1500
        ]
        raw_imgs.sort(key=lambda inf: (inf["bbox"][1], inf["bbox"][0]))
        img_idx_on_page = 0
        for inf in raw_imgs:
            bb = fitz.Rect(inf["bbox"])
            if inf["width"] < 6 or inf["height"] < 6 or bb.width < 4 or bb.height < 4:
                continue
            if any(abs(bb.x0 - sb.x0) < 2 and abs(bb.y0 - sb.y0) < 2 and abs(bb.x1 - sb.x1) < 2 and abs(bb.y1 - sb.y1) < 2 for sb in seen_bboxes):
                continue
            seen_bboxes.append(bb)
            img_idx_on_page += 1

            fname = f"{meta['slug']}_p{pno+1}_img{img_idx_on_page}.png"
            fpath = os.path.join(img_out_dir, fname)
            url = f"/images/pyq/{meta['year'] if 'year' in meta else 2023}/{fname}"
            if write_images:
                c24.render_crisp_native_png(page, inf, fpath)
            saved_images.append((fname, bb, pno + 1))

            stream.append({
                "kind": "IMG",
                "pno": pno,
                "x0": bb.x0,
                "y0": bb.y0,
                "x1": bb.x1,
                "y1": bb.y1,
                "url": url,
            })

        for inf in page.get_image_info(xrefs=True):
            wh = (inf["width"], inf["height"])
            if wh in ICON_SIZES:
                bb = fitz.Rect(inf["bbox"])
                stream.append({
                    "kind": "MARK",
                    "mark": "TICK" if wh in TICK_SIZES else "CROSS",
                    "pno": pno,
                    "x0": bb.x0,
                    "y0": bb.y0,
                    "x1": bb.x1,
                    "y1": bb.y1,
                })

        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0:
                continue
            for raw_l in b["lines"]:
                for l in split_q_marker_spans(raw_l):
                    raw_txt = c24.build_span_text_with_scripts(l)
                    txt = raw_txt.strip()
                    if not txt:
                        continue
                    bb = l["bbox"]
                    if txt.startswith("Section :"):
                        sec_x0s.append(bb[0])
                    cols = set(f"#{s['color']:06x}" for s in l["spans"] if s["text"].strip())
                    final_txt = c24.apply_underlines_to_line(page, l, txt, underlines)
                    final_txt = re.sub(r"[ \t]+", " ", final_txt).strip()
                    stream.append({
                        "kind": "TXT",
                        "pno": pno,
                        "x0": bb[0],
                        "y0": bb[1],
                        "x1": bb[2],
                        "y1": bb[3],
                        "text": final_txt,
                        "colors": cols,
                    })

    # Page 1 candidate table cut
    p0_secs = [ev["y0"] for ev in stream if ev["pno"] == 0 and ev["kind"] == "TXT" and ev["text"].startswith("Section :")]
    if p0_secs:
        p0_cut_y = min(p0_secs) - 2.0
        stream = [ev for ev in stream if not (ev["pno"] == 0 and ev["y0"] < p0_cut_y)]

    margin_x = (min(sec_x0s) - 20.5) if sec_x0s else 0.0
    col1_max_x = margin_x + 34.0
    opt_label_min_x = margin_x + 36.0

    for ev in stream:
        ev["yg"] = ev["pno"] * 1000.0 + ev["y0"]
    stream.sort(key=lambda e: (e["pno"], round(e["y0"], 1), e["x0"]))
    stream = c24.merge_wrapped_col1_markers(stream, margin_x)

    sec_starts = []
    for idx, ev in enumerate(stream):
        if ev["kind"] == "TXT" and ev["text"].startswith("Section :"):
            sec_name = ev["text"].split(":", 1)[1].strip()
            sec_starts.append((idx, sec_name))

    assert len(sec_starts) == 4, f"Expected 4 sections, found {len(sec_starts)}: {sec_starts}"

    all_questions = []
    for s_i, (start_idx, sec_name) in enumerate(sec_starts):
        end_idx = sec_starts[s_i + 1][0] if s_i + 1 < len(sec_starts) else len(stream)
        sec_stream = stream[start_idx + 1:end_idx]

        expected_sec, offset = SECTION_ORDER[s_i]
        assert expected_sec.lower() in sec_name.lower(), f"Section mismatch: got {sec_name}, expected {expected_sec}"

        q_markers = []
        for idx, ev in enumerate(sec_stream):
            if ev["kind"] == "TXT" and ev["x0"] <= col1_max_x:
                m = re.match(r"^Q\.(\d+)$", ev["text"])
                if m:
                    q_markers.append((int(m.group(1)), idx, ev["yg"]))

        assert len(q_markers) == 25, f"Section '{sec_name}' has {len(q_markers)} questions, expected 25"
        assert [q[0] for q in q_markers] == list(range(1, 26)), f"Non-sequential question numbers in {sec_name}"

        prev_cut_yg = -1.0
        for qi in range(25):
            q_local_num, q_sidx, q_yg = q_markers[qi]
            next_q_yg = q_markers[qi + 1][2] - 4.0 if qi + 1 < 25 else 1e12

            q_top_yg = max(prev_cut_yg + 0.01, q_yg - 4.0)
            comp_ygs = [
                ev["yg"] for ev in sec_stream
                if prev_cut_yg < ev["yg"] < q_top_yg
                and ev["kind"] == "TXT" and ev["text"].startswith("Comprehension:")
            ]
            if comp_ygs:
                q_top_yg = min(comp_ygs) - 1.0

            next_comp_ygs = [
                ev["yg"] for ev in sec_stream
                if q_yg < ev["yg"] < next_q_yg
                and ev["kind"] == "TXT" and ev["text"].startswith("Comprehension:")
            ]
            q_bot_limit = min(next_comp_ygs) - 0.5 if next_comp_ygs else next_q_yg

            block = [ev for ev in sec_stream if q_top_yg <= ev["yg"] < q_bot_limit]

            ans_markers = [ev for ev in block if ev["kind"] == "TXT" and ev["x0"] <= col1_max_x and ev["text"] == "Ans"]
            assert len(ans_markers) == 1, f"{sec_name} Q.{q_local_num}: expected 1 Ans marker, got {len(ans_markers)}"
            ans_yg = ans_markers[0]["yg"]

            opt_labels = [
                ev for ev in block
                if ev["yg"] >= ans_yg - 2.0
                and ev["kind"] == "TXT"
                and ev["x0"] >= opt_label_min_x
                and re.match(r"^[1-4]\.(?:\s|$)", ev["text"])
                and is_colored_opt_label(ev["colors"])
            ]
            assert len(opt_labels) == 4, f"{sec_name} Q.{q_local_num}: expected 4 opt labels, got {len(opt_labels)}: {[o['text'] for o in opt_labels]}"

            opt_content_min_x = min(o["x0"] for o in opt_labels) + 5.0
            opt_cont_min_x = min(o["x0"] for o in opt_labels) - 3.0

            body_items = []
            post_ans_items = []
            for ev in block:
                if ev["yg"] < ans_yg - 0.5:
                    if ev["x0"] > col1_max_x or (ev["kind"] == "TXT" and ev["text"].startswith("Comprehension:")):
                        body_items.append(ev)
                else:
                    post_ans_items.append(ev)

            qid_val = ""
            qid_yg = 1e12
            for ev in post_ans_items:
                if ev["kind"] == "TXT" and "Question ID" in ev["text"]:
                    m_qid = re.search(r"Question\s*ID\s*:\s*(\d+)", ev["text"])
                    if m_qid and not qid_val:
                        qid_val = m_qid.group(1)
                    qid_yg = min(qid_yg, ev["yg"])

            opts = {1: "", 2: "", 3: "", 4: ""}
            opt_y_centers = []
            opt_nums = []
            for oi, o_ev in enumerate(opt_labels):
                m_o = re.match(r"^([1-4])\.\s*(.*)$", o_ev["text"])
                onum = int(m_o.group(1))
                opts[onum] = m_o.group(2).strip()
                opt_nums.append(onum)
                opt_y_centers.append((onum, o_ev["pno"] * 1000.0 + (o_ev["y0"] + o_ev["y1"]) / 2.0))

            for ev in post_ans_items:
                if ev["kind"] == "TXT" and ev["x0"] > col1_max_x and ev["yg"] < qid_yg - 2.0:
                    if ev in opt_labels:
                        continue
                    if any(k in ev["text"] for k in ("Question ID", "Status :", "Chosen Option")):
                        continue
                    target_onum = opt_nums[0]
                    for o_ev, onum in zip(opt_labels, opt_nums):
                        if o_ev["yg"] - 2.0 <= ev["yg"]:
                            target_onum = onum
                    opts[target_onum] = (opts[target_onum] + " " + ev["text"]).strip()

            for ev in post_ans_items:
                if ev["kind"] == "IMG" and ev["x0"] > col1_max_x and ev["yg"] < qid_yg - 2.0:
                    ev_yc = ev["pno"] * 1000.0 + (ev["y0"] + ev["y1"]) / 2.0
                    nearest = min(opt_y_centers, key=lambda c: abs(c[1] - ev_yc))[0]
                    img_md = f"![Option {chr(64+nearest)}]({ev['url']})"
                    opts[nearest] = (opts[nearest] + " " + img_md).strip() if opts[nearest] else img_md

            ticks_in_block = [ev for ev in post_ans_items if ev["kind"] == "MARK" and ev["mark"] == "TICK"]
            assert len(ticks_in_block) == 1, f"{sec_name} Q.{q_local_num}: expected 1 TICK, got {len(ticks_in_block)}"
            tick_yg = ticks_in_block[0]["yg"]
            dist_to_lbls = [abs(tick_yg - lbl["yg"]) for lbl in opt_labels]
            chosen_opt_idx = dist_to_lbls.index(min(dist_to_lbls))
            green_idxs = [
                oi for oi, lbl in enumerate(opt_labels)
                if any(
                    len(hx) == 7 and hx.startswith("#") and int(hx[3:5], 16) > 120 and int(hx[1:3], 16) < 100
                    for hx in lbl.get("colors", ())
                )
            ]
            assert len(green_idxs) == 1 and green_idxs[0] == chosen_opt_idx, (
                f"{sec_name} Q.{q_local_num}: TICK idx={chosen_opt_idx} vs green idxs={green_idxs}"
            )
            correct_answer = "ABCD"[chosen_opt_idx]

            q_text_fmt = c24.format_body_items(body_items, f"{meta['slug']}_q{offset + q_local_num}")

            prev_cut_yg = max(ev["pno"] * 1000.0 + ev["y1"] for ev in post_ans_items)

            q_entry = {
                "question_number": offset + q_local_num,
                "question_id": qid_val,
                "section": expected_sec,
                "question_text": q_text_fmt,
                "option_a": opts[1],
                "option_b": opts[2],
                "option_c": opts[3],
                "option_d": opts[4],
                "correct_answer": correct_answer,
                "explanation": "",
            }

            if qid_val and qid_val in hi_overrides:
                ov = hi_overrides[qid_val]
                q_entry["question_text"] = ov["question_text"]
                q_entry["option_a"] = ov["option_a"]
                q_entry["option_b"] = ov["option_b"]
                q_entry["option_c"] = ov["option_c"]
                q_entry["option_d"] = ov["option_d"]
                q_entry["correct_answer"] = ov["correct_answer"]

            all_questions.append(q_entry)

    doc.close()
    return all_questions, saved_images

def extract_type_b_pdf(pdf_path, meta, img_out_dir):
    url_prefix = f"/images/pyq/{meta['year'] if 'year' in meta else 2023}"
    questions, audit_flags = tb.parse_type_b_pdf(pdf_path, meta["slug"], img_out_dir, url_prefix)
    return questions, audit_flags

def _req_retry(method, req_url, **kwargs):
    """Execute a Supabase REST request with exponential backoff on transient network/DNS errors."""
    delays = [2, 5, 10, 20, 30]
    for attempt in range(len(delays) + 1):
        try:
            r = requests.request(method, req_url, timeout=30, **kwargs)
            r.raise_for_status()
            return r
        except requests.exceptions.RequestException as e:
            if attempt >= len(delays):
                raise
            wait_s = delays[attempt]
            print(f"[Supabase Retry {attempt+1}/{len(delays)}] {type(e).__name__}: retrying in {wait_s}s...")
            time.sleep(wait_s)


def sync_to_supabase(meta, questions):
    url, key = c24.load_supabase_creds()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    r_ex = _req_retry(
        "GET",
        f"{url}/rest/v1/previous_papers",
        params={"select": "id,title", "title": f"eq.{meta['db_title']}"},
        headers=headers,
    )
    existing = r_ex.json()
    if existing:
        paper_id = existing[0]["id"]
        print(f"Found existing paper ID={paper_id} for '{meta['db_title']}'. Refreshing questions...")
    else:
        payload = {
            "exam_id": 1,  # SSC CGL
            "title": meta["db_title"],
            "year": 2023,
            "total_questions": len(questions),
            "duration_minutes": 60,
            "is_active": True,
            "test_type": "pyq",
        }
        r_cr = _req_retry(
            "POST",
            f"{url}/rest/v1/previous_papers",
            headers={**headers, "Prefer": "return=representation"},
            json=payload,
        )
        paper_id = r_cr.json()[0]["id"]
        print(f"Created previous_papers row ID={paper_id}: '{meta['db_title']}'")

    _req_retry("DELETE", f"{url}/rest/v1/paper_questions?paper_id=eq.{paper_id}", headers=headers)

    for i in range(0, len(questions), 50):
        batch = []
        for q in questions[i : i + 50]:
            batch.append({
                "paper_id": paper_id,
                "question_number": q["question_number"],
                "question_text": q["question_text"],
                "option_a": q["option_a"],
                "option_b": q["option_b"],
                "option_c": q["option_c"],
                "option_d": q["option_d"],
                "correct_answer": q["correct_answer"],
                "explanation": q.get("explanation") or "",
            })
        _req_retry("POST", f"{url}/rest/v1/paper_questions", headers=headers, json=batch)

    return paper_id

def process_one_2023_pdf(pdf_path, apply=False):
    if not os.path.isfile(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    meta = get_metadata_for_pdf(pdf_path)
    print(f"\n==========================================")
    print(f"Processing: {os.path.basename(pdf_path)}")
    print(f"Title: {meta['db_title']}")
    print(f"Type: {meta['type']} | Shift: {meta['shift']} | Slug: {meta['slug']}")
    print(f"==========================================")

    img_dir = os.path.join(REPO_ROOT, "public", "images", "pyq", "2023")
    os.makedirs(img_dir, exist_ok=True)

    if meta["type"] == "A":
        questions, saved_imgs = extract_type_a_pdf(pdf_path, meta, img_dir, write_images=apply)
        print(f"Type A Extracted {len(questions)}/100 questions | Images: {len(saved_imgs)}")
    else:
        questions, audit_flags = extract_type_b_pdf(pdf_path, meta, img_dir)
        print(f"Type B Extracted {len(questions)}/100 questions | Audit flags: {len(audit_flags)}")

    # Strict Validation
    assert len(questions) == 100, f"Expected 100 questions, got {len(questions)}"
    for idx, q in enumerate(questions, 1):
        assert q["question_number"] == idx, f"Q{idx} number mismatch"
        assert q["question_text"].strip(), f"Q{idx} empty question text"
        assert q["option_a"].strip(), f"Q{idx} empty option_a"
        assert q["option_b"].strip(), f"Q{idx} empty option_b"
        assert q["option_c"].strip(), f"Q{idx} empty option_c"
        assert q["option_d"].strip(), f"Q{idx} empty option_d"
        assert q["correct_answer"] in ("A", "B", "C", "D"), f"Q{idx} invalid correct_answer: {q['correct_answer']}"

    print("ALL 100 QUESTIONS VALIDATED SUCCESSFULLY! 0 empty options, valid answers.")

    if not apply:
        print("DRY RUN ONLY (pass --apply to write DB, backups, and public PDF)")
        return meta, questions

    # 1. Sync to Supabase
    paper_id = sync_to_supabase(meta, questions)

    # 2. Save backup JSON in src/data/pyq_backup/
    backup_dir = os.path.join(REPO_ROOT, "src", "data", "pyq_backup")
    os.makedirs(backup_dir, exist_ok=True)
    backup_json = os.path.join(backup_dir, f"{meta['slug']}.json")
    rows_for_backup = [{"paper_id": paper_id, **q} for q in questions]
    with open(backup_json, "w", encoding="utf-8") as f:
        json.dump(rows_for_backup, f, ensure_ascii=False, indent=2)
    print(f"Backup JSON saved: {backup_json}")

    # 3. Copy PDF into public/papers/ under slug
    public_papers_dir = os.path.join(REPO_ROOT, "public", "papers")
    os.makedirs(public_papers_dir, exist_ok=True)
    public_pdf_path = os.path.join(public_papers_dir, f"{meta['slug']}.pdf")
    shutil.copy2(pdf_path, public_pdf_path)
    print(f"Public PDF copied: {public_pdf_path}")

    # 4. Rename source PDF if needed
    folder = os.path.dirname(pdf_path)
    target_renamed = os.path.join(folder, meta["pdf_filename"])
    if os.path.abspath(pdf_path) != os.path.abspath(target_renamed):
        if not os.path.exists(target_renamed):
            os.rename(pdf_path, target_renamed)
            print(f"Renamed source PDF: {os.path.basename(pdf_path)} -> {meta['pdf_filename']}")
        else:
            print(f"Target file already exists, skipped rename: {target_renamed}")

    fitz.TOOLS.store_shrink(100)
    gc.collect()
    return meta, questions

def main():
    parser = argparse.ArgumentParser(description="Convert ONE 2023 DigiALM PDF into CBT Mode")
    parser.add_argument("--pdf", required=True, help="Exact path to ONE PDF file to process")
    parser.add_argument("--apply", action="store_true", help="Rename PDF, copy to public/papers, save JSON backup, and sync to Supabase")
    args = parser.parse_args()
    process_one_2023_pdf(args.pdf, apply=args.apply)

if __name__ == "__main__":
    main()
