import argparse
import io
import json
import os
import re
import shutil
import sys
import fitz
import requests
from datetime import datetime
from PIL import Image, ImageChops

sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = r"c:\ssczone"
TICK_XREF = 5
CROSS_XREF = 9

SECTION_ORDER = [
    ("General Intelligence and Reasoning", 0),
    ("General Awareness", 25),
    ("Quantitative Aptitude", 50),
    ("English Comprehension", 75),
]

SUPERSCRIPT_MAP = str.maketrans("0123456789+-=()nxy", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿˣʸ")
SUBSCRIPT_MAP = str.maketrans("0123456789+-=()", "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎")


def load_supabase_creds():
    env_path = os.path.join(REPO_ROOT, ".env.local")
    env = {}
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k] = v.strip().strip('"').strip("'")
    url = env["NEXT_PUBLIC_SUPABASE_URL"]
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    return url, key


def parse_pdf_metadata(doc):
    p0_top = doc[0].get_text("text", clip=fitz.Rect(0, 0, doc[0].rect.width, 200))
    m_banner = re.search(r"(Combined Graduate Level Examination[^\n]+)", p0_top)
    m_date = re.search(r"\b(\d{2}/\d{2}/\d{4})\b", p0_top)
    m_time = re.search(r"(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)", p0_top, re.I)

    exam_banner = m_banner.group(1).strip() if m_banner else ""
    exam_date = m_date.group(1).strip() if m_date else ""
    exam_time = m_time.group(1).strip() if m_time else ""

    dt = datetime.strptime(exam_date, "%d/%m/%Y")
    day = str(dt.day)
    month_full = dt.strftime("%B")
    month_short = "Sept" if dt.month == 9 else dt.strftime("%b")
    year = dt.year

    # Determine shift from exam_time
    t_norm = exam_time.upper().replace(" ", "")
    if t_norm.startswith("9:") or t_norm.startswith("09:"):
        shift = 1
    elif t_norm.startswith("12:") or t_norm.startswith("1:"):
        shift = 2
    elif t_norm.startswith("4:") or t_norm.startswith("04:"):
        shift = 3
    else:
        raise ValueError(f"Unrecognized Exam Time '{exam_time}' in metadata")

    # Determine tier
    tier = "Tier-II" if "TIER II" in exam_banner.upper() or "TIER-II" in exam_banner.upper() else "Tier-I"

    pdf_filename = f"SSC CGL {year} {tier} (Held On {day} {month_short} {year} Shift {shift}).pdf"
    db_title = f"SSC CGL {year} {tier} (Held On {day} {month_full} {year} Shift {shift})"
    slug = f"ssc-cgl-{year}-{day}-{month_full.lower()}-{year}-shift-{shift}"

    return {
        "exam_banner": exam_banner,
        "exam_date": exam_date,
        "exam_time": exam_time,
        "year": year,
        "tier": tier,
        "shift": shift,
        "pdf_filename": pdf_filename,
        "db_title": db_title,
        "slug": slug,
    }


def extract_underlines(page, pno):
    underlines = []
    for dr in page.get_drawings():
        r = dr["rect"]
        # Header table border on page 1 sits at y < 200
        if pno == 0 and r.y0 < 200:
            continue
        if r.height <= 2.2 and 4.0 <= r.width <= 360.0:
            underlines.append(r)
    return underlines


def build_span_text_with_scripts(line):
    """Build line text from spans, preserving Unicode super/subscripts."""
    spans = [s for s in line["spans"] if s["text"]]
    if not spans:
        return ""
    normal_ys = [s["origin"][1] for s in spans if s["size"] >= 8.2 and s["text"].strip()]
    base_y = max(set(normal_ys), key=normal_ys.count) if normal_ys else spans[0]["origin"][1]

    parts = []
    for s in spans:
        txt = s["text"].replace("\xa0", " ")
        sz = s["size"]
        oy = s["origin"][1]
        if sz < 8.0 and txt.strip():
            # Avoid converting ordinary punctuation if same baseline
            if oy < base_y - 1.2:
                parts.append(txt.translate(SUPERSCRIPT_MAP))
            elif oy > base_y + 1.2:
                parts.append(txt.translate(SUBSCRIPT_MAP))
            else:
                parts.append(txt)
        else:
            parts.append(txt)
    return "".join(parts)


def apply_underlines_to_line(page, line, raw_text, underlines):
    """Wrap any words in raw_text whose bbox sits immediately above an underline rect with <u>...</u>."""
    if not underlines:
        return raw_text
    lrect = fitz.Rect(line["bbox"])
    cand_uls = [
        ul for ul in underlines
        if (lrect.y1 - 5.0 <= ul.y0 <= lrect.y1 + 4.0)
        and min(lrect.x1, ul.x1) - max(lrect.x0, ul.x0) > 3.0
    ]
    if not cand_uls:
        return raw_text

    # Use page words in this line's y-band for accurate word boundaries
    words = [
        w for w in page.get_text("words")
        if w[1] >= lrect.y0 - 2.0 and w[3] <= lrect.y1 + 2.0
        and w[0] >= lrect.x0 - 2.0 and w[2] <= lrect.x1 + 2.0
    ]
    words.sort(key=lambda w: w[0])

    # Identify contiguous word sequences covered by an underline
    covered_words = []
    for w in words:
        wx0, wy0, wx1, wy1, wtxt = w[0], w[1], w[2], w[3], w[4]
        ww = max(1.0, wx1 - wx0)
        is_ul = any(
            (min(wx1, ul.x1) - max(wx0, ul.x0)) / ww >= 0.45
            and (wy1 - 4.5 <= ul.y0 <= wy1 + 3.5)
            for ul in cand_uls
        )
        covered_words.append((wtxt, is_ul))

    if not any(flag for _, flag in covered_words):
        return raw_text

    rebuilt = []
    in_ul = False
    for idx, (wtxt, is_ul) in enumerate(covered_words):
        # Strip trailing punctuation if it happens to stick outside meaningful word (e.g. "hot;")
        m_trail = re.match(r"^(.*?)([;,?.!:]+)$", wtxt)
        clean_w = wtxt
        trail = ""
        if is_ul and m_trail and m_trail.group(1):
            clean_w, trail = m_trail.group(1), m_trail.group(2)

        if is_ul and not in_ul:
            rebuilt.append("<u>" + clean_w)
            in_ul = True
        elif is_ul and in_ul:
            rebuilt[-1] += " " + clean_w
        elif not is_ul and in_ul:
            rebuilt[-1] += "</u>"
            in_ul = False
            rebuilt.append(wtxt)
        else:
            rebuilt.append(wtxt)

        if trail and in_ul:
            # Peak next word: if next word is not underlined, close before punctuation
            next_is_ul = (idx + 1 < len(covered_words)) and covered_words[idx + 1][1]
            if not next_is_ul:
                rebuilt[-1] += "</u>" + trail
                in_ul = False
            else:
                rebuilt[-1] += trail

    if in_ul:
        rebuilt[-1] += "</u>"

    return " ".join(rebuilt)


def detect_tick_cross(doc):
    """Detect tick/cross image xrefs dynamically across first pages."""
    found = {}
    for pno in range(min(3, len(doc))):
        for inf in doc[pno].get_image_info(xrefs=True):
            w, h, x = inf["width"], inf["height"], inf["xref"]
            if (w, h) == (16, 16):
                found["tick"] = x
            elif (w, h) == (31, 21):
                found["cross"] = x
        if "tick" in found and "cross" in found:
            break
    return found.get("tick", TICK_XREF), found.get("cross", CROSS_XREF)


def should_join_with_space(prev_item, curr_item):
    """Heuristic to join prose lines wrapped at PDF right margin while preserving structural newlines."""
    if prev_item["kind"] != "TXT" or curr_item["kind"] != "TXT":
        return False
    prev_t = prev_item["text"]
    curr_t = curr_item["text"]

    # Preserve newlines around passage/question labels or bullets
    structural_starts = (
        "Statements:", "Conclusions:", "Conclusion:", "Assumptions:",
        "Courses of Action:", "Comprehension:", "(I)", "(II)", "(III)", "(IV)",
        "I.", "II.", "III.", "A:", "B:", "C:", "D:", "E:", "1.", "2.", "3.", "4.",
        "NOTE:", "(NOTE", "Select the", "Identify the", "Read the", "How many",
        "In a certain", "Study the", "Find the", "What is"
    )
    if prev_t.endswith(":") or any(curr_t.startswith(s) for s in structural_starts):
        return False
    # If previous line wrapped near right edge (x1 >= 490) in same page, join with space
    if prev_item["pno"] == curr_item["pno"] and prev_item["x1"] >= 485:
        return True
    # Continuation of a wrapped sentence across page break
    if prev_item["pno"] + 1 == curr_item["pno"] and prev_item["x1"] >= 485:
        return True
    return False


def format_body_items(items, img_counter_prefix):
    """Order question body items into clean text with inline/block images."""
    if not items:
        return ""
    # Group items into visual rows if on same page and y-ranges overlap significantly
    lines_out = []
    i = 0
    while i < len(items):
        row = [items[i]]
        pno = items[i]["pno"]
        r_y0, r_y1 = items[i]["y0"], items[i]["y1"]
        j = i + 1
        # Never fold tall charts/diagrams (>42pt) into an inline text row
        is_row_tall_img = (items[i]["kind"] == "IMG" and (r_y1 - r_y0) > 42.0)
        while j < len(items) and items[j]["pno"] == pno:
            if is_row_tall_img or (items[j]["kind"] == "IMG" and (items[j]["y1"] - items[j]["y0"]) > 42.0):
                break
            oy0, oy1 = items[j]["y0"], items[j]["y1"]
            overlap = min(r_y1, oy1) - max(r_y0, oy0)
            min_h = min(r_y1 - r_y0, oy1 - oy0)
            if overlap > 0.35 * max(1.0, min_h):
                row.append(items[j])
                r_y0 = min(r_y0, oy0)
                r_y1 = max(r_y1, oy1)
                j += 1
            else:
                break

        if len(row) > 1:
            row.sort(key=lambda it: it["x0"])
            inline_parts = []
            for it in row:
                if it["kind"] == "TXT":
                    inline_parts.append(it["text"])
                else:
                    inline_parts.append(f"![Inline]({it['url']})")
            lines_out.append({
                "kind": "TXT",
                "pno": pno,
                "x0": row[0]["x0"],
                "x1": row[-1]["x1"],
                "y0": r_y0,
                "y1": r_y1,
                "text": " ".join(inline_parts),
            })
        else:
            it = row[0]
            if it["kind"] == "IMG":
                lines_out.append({"kind": "IMG", "pno": pno, "x0": it["x0"], "x1": it["x1"], "y0": it["y0"], "y1": it["y1"], "text": f"\n![Figure]({it['url']})\n"})
            else:
                lines_out.append(it)
        i = j

    # Now assemble paragraphs cleanly
    chunks = []
    for idx, it in enumerate(lines_out):
        if it["kind"] == "IMG":
            chunks.append(it["text"].strip())
            continue
        if chunks and not chunks[-1].startswith("![Figure]") and should_join_with_space(lines_out[idx - 1], it):
            chunks[-1] = chunks[-1] + " " + it["text"]
        else:
            chunks.append(it["text"])

    text = "\n".join(chunks)
    # Clean extra spaces before punctuation or blank lines
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def render_crisp_native_png(page, inf, out_path, max_w=1600, max_h=900):
    """Render PDF raster/diagram at its native 1:1 bitmap density (never blurry upscaled) and trim blank edges."""
    raw_bb = fitz.Rect(inf["bbox"])
    bb = raw_bb & page.rect
    # If image bbox overflows PDF page bounds, extract unclipped embedded raster + smask
    if (
        inf.get("xref")
        and page.parent is not None
        and (
            raw_bb.x1 > page.rect.x1 + 1
            or raw_bb.x0 < page.rect.x0 - 1
            or raw_bb.y1 > page.rect.y1 + 1
            or raw_bb.y0 < page.rect.y0 - 1
        )
    ):
        doc = page.parent
        ex = doc.extract_image(inf["xref"])
        xpix = fitz.Pixmap(doc, inf["xref"])
        if ex.get("smask"):
            xpix = fitz.Pixmap(xpix, fitz.Pixmap(doc, ex["smask"]))
        elif xpix.colorspace and xpix.colorspace.n != 3:
            xpix = fitz.Pixmap(fitz.csRGB, xpix)
        im_raw = Image.open(io.BytesIO(xpix.tobytes("png")))
        if im_raw.mode == "RGBA":
            bg_x = Image.new("RGB", im_raw.size, (255, 255, 255))
            bg_x.paste(im_raw, mask=im_raw.split()[3])
            img = bg_x
        else:
            img = im_raw.convert("RGB")
        if img.width > max_w or img.height > max_h:
            img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    else:
        raw_w = float(inf.get("width") or 0)
        raw_h = float(inf.get("height") or 0)

        sx = (raw_w / bb.width) if (raw_w > 0 and bb.width > 0) else (100.0 / 72.0)
        sy = (raw_h / bb.height) if (raw_h > 0 and bb.height > 0) else sx

        # Avoid blurry upscaling or sub-1x blurry shrinking; only downscale truly huge raw embeds
        if sx < 0.8:
            sx = sy = 100.0 / 72.0
        if bb.width * sx > max_w:
            scale_down = max_w / (bb.width * sx)
            sx *= scale_down
            sy *= scale_down
        if bb.height * sy > max_h:
            scale_down = max_h / (bb.height * sy)
            sx *= scale_down
            sy *= scale_down

        pix = page.get_pixmap(clip=bb, matrix=fitz.Matrix(sx, sy), alpha=False)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)

    # Trim excess solid-white outer canvas when trailing padding is noticeable, keeping a crisp 4px margin
    bg = Image.new("RGB", img.size, (255, 255, 255))
    diff = ImageChops.difference(img, bg).convert("L").point(lambda p: 255 if p > 10 else 0)
    content_bb = diff.getbbox()
    if content_bb:
        cx0, cy0, cx1, cy1 = content_bb
        pad = 4
        nx0 = max(0, cx0 - pad)
        ny0 = max(0, cy0 - pad)
        nx1 = min(img.width, cx1 + pad)
        ny1 = min(img.height, cy1 + pad)
        if (nx1 - nx0) >= 8 and (ny1 - ny0) >= 8 and (img.width - (nx1 - nx0) > 8 or img.height - (ny1 - ny0) > 8):
            img = img.crop((nx0, ny0, nx1, ny1))

    img.save(out_path, format="PNG", optimize=True)


def split_q_marker_spans(line):
    """Split a PyMuPDF line if a Q.<n> marker in col-1 was merged with question body spans on the same y baseline."""
    raw_spans = [s for s in line["spans"] if s["text"]]
    non_ws = [(idx, s) for idx, s in enumerate(raw_spans) if s["text"].strip()]
    if len(non_ws) >= 2:
        _, s0 = non_ws[0]
        idx1, s1 = non_ws[1]
        t0 = s0["text"].strip()
        if re.match(r"^Q\.\d+$", t0):
            gap = s1["bbox"][0] - s0["bbox"][2]
            if gap >= 8.0:
                l1 = {"bbox": s0["bbox"], "spans": [s0]}
                rem = raw_spans[idx1:]
                bx0 = min(s["bbox"][0] for s in rem)
                by0 = min(s["bbox"][1] for s in rem)
                bx1 = max(s["bbox"][2] for s in rem)
                by1 = max(s["bbox"][3] for s in rem)
                l2 = {"bbox": (bx0, by0, bx1, by1), "spans": rem}
                return [l1, l2]
    return [line]


def merge_wrapped_col1_markers(stream, margin_x):
    """Merge vertically wrapped Column-1 markers like 'Q.'+'17', 'Q.1'+'8', 'Q'+'.'+'2'+'1', 'A'+'n'+'s' across interleaved right-column items."""
    col1_limit = margin_x + 34.0
    consumed = set()
    out = []

    for i, ev in enumerate(stream):
        if i in consumed:
            continue

        t = ev.get("text", "") if ev["kind"] == "TXT" else ""
        if ev["kind"] == "TXT" and ev["x0"] <= col1_limit and 1 <= len(t) <= 4:
            is_q_start = t.startswith("Q") and re.fullmatch(r"Q\.?\d*", t) and not re.match(r"^Q\.\d{2,}$", t)
            is_a_start = t in ("A", "An")

            if is_q_start or is_a_start:
                comb = t
                last_y1 = ev["y1"]
                matched_idxs = [i]
                best_end = None

                j = i + 1
                while j < len(stream):
                    nxt = stream[j]
                    if nxt["pno"] != ev["pno"] or nxt["y0"] - last_y1 > 5.5:
                        break
                    if j in consumed or nxt["kind"] != "TXT" or nxt["x0"] > col1_limit:
                        j += 1
                        continue
                    nt = nxt["text"]
                    if nxt["y0"] - last_y1 < -0.5 or len(nt) > 4:
                        j += 1
                        continue

                    if is_q_start and re.fullmatch(r"[.\d]+", nt):
                        cand = comb + nt
                        # Prevent Q.1 from absorbing random text; only form valid Q.<1..25>
                        m_q = re.match(r"^Q\.(\d+)$", cand)
                        if m_q and int(m_q.group(1)) > 25:
                            break
                        comb = cand
                        last_y1 = max(last_y1, nxt["y1"])
                        matched_idxs.append(j)
                        if re.match(r"^Q\.\d+$", comb):
                            best_end = list(matched_idxs)
                            # If two digits already formed (Q.10..Q.25), stop immediately
                            if re.match(r"^Q\.\d{2,}$", comb):
                                break
                    elif is_a_start and re.fullmatch(r"[ns]+", nt) and (comb + nt) in ("An", "Ans"):
                        comb += nt
                        last_y1 = max(last_y1, nxt["y1"])
                        matched_idxs.append(j)
                        if comb == "Ans":
                            best_end = list(matched_idxs)
                            break
                    j += 1

                if best_end and len(best_end) > 1:
                    for idx_c in best_end:
                        consumed.add(idx_c)
                    merged = dict(ev)
                    merged["text"] = "".join(stream[idx_c]["text"] for idx_c in best_end)
                    merged["y1"] = max(stream[idx_c]["y1"] for idx_c in best_end)
                    out.append(merged)
                    continue

        out.append(ev)
    return out


def extract_all_questions(pdf_path, meta, img_out_dir, write_images=True):
    doc = fitz.open(pdf_path)
    tick_xref, cross_xref = detect_tick_cross(doc)
    os.makedirs(img_out_dir, exist_ok=True)

    # First pass: collect ordered global events per page
    stream = []
    saved_images = []
    sec_x0s = []

    for pno, page in enumerate(doc):
        underlines = extract_underlines(page, pno)

        # Unique content images on page (exclude tick/cross icons)
        seen_bboxes = []
        raw_imgs = [inf for inf in page.get_image_info(xrefs=True) if inf["xref"] not in (tick_xref, cross_xref)]
        raw_imgs.sort(key=lambda inf: (inf["bbox"][1], inf["bbox"][0]))
        img_idx_on_page = 0
        for inf in raw_imgs:
            bb = fitz.Rect(inf["bbox"])
            if inf["width"] < 6 or inf["height"] < 6 or bb.width < 4 or bb.height < 4:
                continue
            # Deduplicate identical bounding boxes on same page
            if any(abs(bb.x0 - sb.x0) < 2 and abs(bb.y0 - sb.y0) < 2 and abs(bb.x1 - sb.x1) < 2 and abs(bb.y1 - sb.y1) < 2 for sb in seen_bboxes):
                continue
            seen_bboxes.append(bb)
            img_idx_on_page += 1

            fname = f"{meta['slug']}_p{pno+1}_img{img_idx_on_page}.png"
            fpath = os.path.join(img_out_dir, fname)
            url = f"/images/pyq/{meta['year']}/{fname}"
            if write_images:
                render_crisp_native_png(page, inf, fpath)
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

        # Tick / Cross markers
        for inf in page.get_image_info(xrefs=True):
            if inf["xref"] in (tick_xref, cross_xref):
                bb = fitz.Rect(inf["bbox"])
                stream.append({
                    "kind": "MARK",
                    "mark": "TICK" if inf["xref"] == tick_xref else "CROSS",
                    "pno": pno,
                    "x0": bb.x0,
                    "y0": bb.y0,
                    "x1": bb.x1,
                    "y1": bb.y1,
                })

        # Text lines (splitting merged col-1 Q.<n> + body spans when necessary)
        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0:
                continue
            for raw_l in b["lines"]:
                for l in split_q_marker_spans(raw_l):
                    raw_txt = build_span_text_with_scripts(l)
                    txt = raw_txt.strip()
                    if not txt:
                        continue
                    bb = l["bbox"]
                    if txt.startswith("Section :"):
                        sec_x0s.append(bb[0])
                    cols = set(f"#{s['color']:06x}" for s in l["spans"] if s["text"].strip())
                    final_txt = apply_underlines_to_line(page, l, txt, underlines)
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

    # Drop Page 1 candidate metadata table above the first "Section :" line (works for any header height)
    p0_secs = [ev["y0"] for ev in stream if ev["pno"] == 0 and ev["kind"] == "TXT" and ev["text"].startswith("Section :")]
    if p0_secs:
        p0_cut_y = min(p0_secs) - 2.0
        stream = [ev for ev in stream if not (ev["pno"] == 0 and ev["y0"] < p0_cut_y)]

    # Dynamic left-margin shift (0.0 for standard x0~20.5 PDFs, ~77-88pt for centered PDFs)
    margin_x = (min(sec_x0s) - 20.5) if sec_x0s else 0.0
    col1_max_x = margin_x + 34.0
    opt_label_min_x = margin_x + 36.0

    # Assign continuous y_global to preserve exact top-to-bottom order across pages
    for ev in stream:
        ev["yg"] = ev["pno"] * 1000.0 + ev["y0"]
    stream.sort(key=lambda e: (e["pno"], round(e["y0"], 1), e["x0"]))
    stream = merge_wrapped_col1_markers(stream, margin_x)

    # Find Section boundaries
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

        # Expected global offset
        expected_sec, offset = SECTION_ORDER[s_i]
        assert expected_sec.lower() in sec_name.lower(), f"Section mismatch: got {sec_name}, expected {expected_sec}"

        # Locate the 25 Q.<k> markers inside this section
        q_markers = []
        for idx, ev in enumerate(sec_stream):
            if ev["kind"] == "TXT" and ev["x0"] <= col1_max_x:
                m = re.match(r"^Q\.(\d+)$", ev["text"])
                if m:
                    q_markers.append((int(m.group(1)), idx, ev["yg"]))

        assert len(q_markers) == 25, f"Section '{sec_name}' has {len(q_markers)} questions, expected 25"
        assert [q[0] for q in q_markers] == list(range(1, 26)), f"Non-sequential question numbers in {sec_name}"

        # Compute exact safe vertical boundary for each Q.<k> inside section
        # Rule: Each Q.<k> starts at max(prev_opt4_or_prev_end, min(comprehension_before_Q_k, q_marker_yg - 4.0))
        # First locate each Q.<k>'s Ans marker and option 4 bottom so preceding Comprehension blocks go to Q.<k>!
        q_slices = []
        prev_cut_yg = -1.0
        for qi in range(25):
            q_local_num, q_sidx, q_yg = q_markers[qi]
            next_q_yg = q_markers[qi + 1][2] - 4.0 if qi + 1 < 25 else 1e12

            # Start search slightly above q_yg (handles -0.2pt jitter like P15 Q21 / P16 Q24)
            # unless that would overlap prev_cut_yg
            q_top_yg = max(prev_cut_yg + 0.01, q_yg - 4.0)

            # Check if there is a "Comprehension:" block between prev_cut_yg and q_top_yg!
            comp_ygs = [
                ev["yg"] for ev in sec_stream
                if prev_cut_yg < ev["yg"] < q_top_yg
                and ev["kind"] == "TXT" and ev["text"].startswith("Comprehension:")
            ]
            if comp_ygs:
                q_top_yg = min(comp_ygs) - 1.0

            # Now find items inside [q_top_yg, next_q_yg), stopped at any next Comprehension: belonging to Q.<k+1>
            next_comp_ygs = [
                ev["yg"] for ev in sec_stream
                if q_yg < ev["yg"] < next_q_yg
                and ev["kind"] == "TXT" and ev["text"].startswith("Comprehension:")
            ]
            q_bot_limit = min(next_comp_ygs) - 0.5 if next_comp_ygs else next_q_yg

            block = [ev for ev in sec_stream if q_top_yg <= ev["yg"] < q_bot_limit]

            # Find Ans label inside block
            ans_markers = [ev for ev in block if ev["kind"] == "TXT" and ev["x0"] <= col1_max_x and ev["text"] == "Ans"]
            assert len(ans_markers) == 1, f"{sec_name} Q.{q_local_num}: expected 1 Ans marker, got {len(ans_markers)}"
            ans_yg = ans_markers[0]["yg"]

            # Locate 4 colored option labels dynamically using opt_label_min_x
            opt_labels = [
                ev for ev in block
                if ev["yg"] >= ans_yg - 2.0
                and ev["kind"] == "TXT"
                and ev["x0"] >= opt_label_min_x
                and re.match(r"^[1-4]\.(?:\s|$)", ev["text"])
                and ("#40c64b" in ev["colors"] or "#f61818" in ev["colors"])
            ]
            assert len(opt_labels) == 4, f"{sec_name} Q.{q_local_num}: expected 4 opt labels, got {len(opt_labels)}: {[o['text'] for o in opt_labels]}"

            opt_content_min_x = min(o["x0"] for o in opt_labels) + 5.0
            opt_cont_min_x = min(o["x0"] for o in opt_labels) - 3.0

            body_items = []
            post_ans_items = []
            for ev in block:
                if ev["kind"] == "TXT" and ev["x0"] <= col1_max_x and (ev["text"] == f"Q.{q_local_num}" or ev["text"] == "Ans"):
                    continue
                if ev["kind"] == "TXT" and re.match(r"^SubQuestion No\s*:\s*\d+$", ev["text"]):
                    continue
                if ev["kind"] == "IMG" and ev["x0"] >= opt_content_min_x and ev["yg"] >= ans_yg - 3.0:
                    post_ans_items.append(ev)
                elif ev["yg"] < ans_yg - 3.0:
                    body_items.append(ev)
                else:
                    post_ans_items.append(ev)

            # Separate Comprehension heading cleanly if present
            clean_body_items = []
            for ev in body_items:
                if ev["kind"] == "TXT" and ev["text"] == "Comprehension:":
                    continue
                clean_body_items.append(ev)

            q_text = format_body_items(clean_body_items, f"q{offset + q_local_num}")

            # Verify options 1..4 & correct answer
            opts = {1: "", 2: "", 3: "", 4: ""}
            green_num = None
            tick_num = None

            opt_y_centers = []
            for oi, o_ev in enumerate(opt_labels):
                m_o = re.match(r"^([1-4])\.\s*(.*)$", o_ev["text"])
                onum = int(m_o.group(1))
                assert onum == oi + 1, f"{sec_name} Q.{q_local_num}: unexpected opt order"
                opts[onum] = m_o.group(2).strip()
                if "#40c64b" in o_ev["colors"]:
                    green_num = onum
                opt_y_centers.append((onum, o_ev["pno"] * 1000.0 + (o_ev["y0"] + o_ev["y1"]) / 2.0))

            # Collect any extra wrapped option text lines inside post_ans_items
            for ev in post_ans_items:
                if ev["kind"] == "TXT" and ev["x0"] >= opt_cont_min_x:
                    if ev in opt_labels:
                        continue
                    # Attach wrapped option continuation text to closest previous/nearest option label
                    ev_yc = ev["pno"] * 1000.0 + (ev["y0"] + ev["y1"]) / 2.0
                    nearest = min(opt_y_centers, key=lambda c: abs(c[1] - ev_yc))[0]
                    opts[nearest] = (opts[nearest] + " " + ev["text"]).strip()

            # Attach post_ans option images to nearest option y-center
            for ev in post_ans_items:
                if ev["kind"] == "IMG":
                    ev_yc = ev["pno"] * 1000.0 + (ev["y0"] + ev["y1"]) / 2.0
                    nearest = min(opt_y_centers, key=lambda c: abs(c[1] - ev_yc))[0]
                    img_md = f"![Option {chr(64+nearest)}]({ev['url']})"
                    opts[nearest] = (opts[nearest] + " " + img_md).strip() if opts[nearest] else img_md

            # Check TICK alignment
            ticks_in_block = [ev for ev in post_ans_items if ev["kind"] == "MARK" and ev["mark"] == "TICK"]
            crosses_in_block = [ev for ev in post_ans_items if ev["kind"] == "MARK" and ev["mark"] == "CROSS"]
            assert len(ticks_in_block) == 1, f"{sec_name} Q.{q_local_num}: expected 1 TICK, got {len(ticks_in_block)}"
            assert len(crosses_in_block) == 3, f"{sec_name} Q.{q_local_num}: expected 3 CROSS, got {len(crosses_in_block)}"
            t_ev = ticks_in_block[0]
            t_yc = t_ev["pno"] * 1000.0 + (t_ev["y0"] + t_ev["y1"]) / 2.0
            tick_num = min(opt_y_centers, key=lambda c: abs(c[1] - t_yc))[0]

            assert green_num is not None and green_num == tick_num, (
                f"{sec_name} Q.{q_local_num}: green={green_num} != tick={tick_num}"
            )
            correct_letter = chr(64 + green_num)

            # Verify no empty question/options
            assert q_text, f"{sec_name} Q.{q_local_num}: empty question_text"
            for onum in (1, 2, 3, 4):
                assert opts[onum], f"{sec_name} Q.{q_local_num}: empty option {onum}"

            # Update prev_cut_yg safely past option 4 & its images
            last_opt_yg = max(ev["pno"] * 1000.0 + ev["y1"] for ev in post_ans_items)
            prev_cut_yg = last_opt_yg

            all_questions.append({
                "question_number": offset + q_local_num,
                "section": sec_name,
                "question_text": q_text,
                "option_a": opts[1],
                "option_b": opts[2],
                "option_c": opts[3],
                "option_d": opts[4],
                "correct_answer": correct_letter,
                "explanation": None,
            })

    doc.close()
    return all_questions, saved_images


def sync_to_supabase(meta, questions):
    url, key = load_supabase_creds()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    # Check if this paper title already exists
    r_ex = requests.get(
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
            "year": meta["year"],
            "total_questions": len(questions),
            "duration_minutes": 60,
            "is_active": True,
            "test_type": "pyq",
        }
        r_cr = requests.post(
            f"{url}/rest/v1/previous_papers",
            headers={**headers, "Prefer": "return=representation"},
            json=payload,
        )
        r_cr.raise_for_status()
        paper_id = r_cr.json()[0]["id"]
        print(f"Created previous_papers row ID={paper_id}: '{meta['db_title']}'")

    # Delete prior questions if refreshing
    requests.delete(f"{url}/rest/v1/paper_questions?paper_id=eq.{paper_id}", headers=headers).raise_for_status()

    # Insert in batches of 50
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
                "explanation": q["explanation"],
            })
        r_ins = requests.post(f"{url}/rest/v1/paper_questions", headers=headers, json=batch)
        r_ins.raise_for_status()

    return paper_id


def main():
    parser = argparse.ArgumentParser(description="Convert ONE 2024 DigiALM PDF into CBT Mode")
    parser.add_argument("--pdf", required=True, help="Exact path to ONE PDF file to process")
    parser.add_argument("--apply", action="store_true", help="Rename PDF, copy to public/papers, save JSON backup, and sync to Supabase")
    args = parser.parse_args()

    if not os.path.isfile(args.pdf):
        raise FileNotFoundError(f"PDF not found: {args.pdf}")

    doc = fitz.open(args.pdf)
    meta = parse_pdf_metadata(doc)
    doc.close()
    print("Metadata:", json.dumps(meta, indent=2))

    img_dir = os.path.join(REPO_ROOT, "public", "images", "pyq", str(meta["year"]))
    questions, saved_imgs = extract_all_questions(args.pdf, meta, img_dir, write_images=args.apply)
    print(f"Extracted {len(questions)}/100 questions | Images: {len(saved_imgs)}")

    # Dump audit preview into scratch/
    preview_path = os.path.join(
        r"C:\Users\Admin\.gemini\antigravity\brain\a4f88990-1ffd-4462-a906-52e3447e1c0c\scratch",
        f"{meta['slug']}_preview.json",
    )
    with open(preview_path, "w", encoding="utf-8") as f:
        json.dump({"meta": meta, "original_pdf": os.path.basename(args.pdf), "questions": questions}, f, ensure_ascii=False, indent=2)
    print(f"Preview JSON written to: {preview_path}")

    if not args.apply:
        print("DRY RUN ONLY (pass --apply to rename PDF, write images, and sync DB)")
        return

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
    shutil.copy2(args.pdf, public_pdf_path)
    print(f"Public PDF copied: {public_pdf_path}")

    # 4. Rename ONLY this one source PDF in its folder
    folder = os.path.dirname(args.pdf)
    target_renamed = os.path.join(folder, meta["pdf_filename"])
    if os.path.abspath(args.pdf) != os.path.abspath(target_renamed):
        if os.path.exists(target_renamed):
            raise FileExistsError(f"Target renamed file already exists: {target_renamed}")
        os.rename(args.pdf, target_renamed)
        print(f"Renamed source PDF: {os.path.basename(args.pdf)} -> {meta['pdf_filename']}")


if __name__ == "__main__":
    main()
