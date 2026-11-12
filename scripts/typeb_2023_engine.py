import os
import re
import gc
import json
import sys
import fitz
import cv2
import numpy as np
from rapidocr_onnxruntime import RapidOCR

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert_digialm_2024_single import render_crisp_native_png

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(SCRIPTS_DIR, "vec_templates_2023.npz")
HI_OVERRIDES_PATH = os.path.join(SCRIPTS_DIR, "hi_overrides_2023.json")
EN_OVERRIDES_PATH = os.path.join(SCRIPTS_DIR, "en_overrides_2023.json")

DPI = 360
SCALE = DPI / 72.0

# Page crop bounds for rendering one clean grayscale strip per page once
PAGE_CLIP = fitz.Rect(45.0, 24.0, 565.0, 768.0)

ICON_SIZES = {(31, 21), (21, 21), (21, 22), (22, 22), (23, 23)}
TICK_SIZES = {(21, 21), (21, 22), (22, 22), (23, 23)}
NON_CONTENT_SIZES = {
    (1274, 1650), (1275, 1650), (1882, 3700), (1883, 3700),
    (138, 130), (198, 130), (1275, 1651), (1276, 1650),
}

SPECIAL_SYMBOLS = set("₹÷√△≅≇≠∠~>≤<αāéçθ≡²³°{}[]")
SUPERSCRIPT_SYMS = {"°", "²", "³"}
OP_CHARS = set("+×÷−=")
FULLWIDTH_TRANS = str.maketrans({
    "？": "?", "，": ",", "：": ":", "；": ";",
    "（": "(", "）": ")", "－": "-", "．": ".", "！": "!",
})
SECTION_HDR_RE = re.compile(
    r"^(?:Secti?o?n|on)?\s*[:：]?\s*"
    r"(?:General\s+Intelligence(?:\s+and\s+Reasoning)?|General\s+Awareness|Quantitative\s+Aptitude|English\s+Comprehension)\s*\n?",
    re.I,
)

_OCR_SINGLETON = None
_TMPL_CACHE = None
_HI_CACHE = None


def get_ocr():
    global _OCR_SINGLETON
    if _OCR_SINGLETON is None:
        _OCR_SINGLETON = RapidOCR()
    return _OCR_SINGLETON


def get_templates():
    """Load vector template matrix along with special/superscript/ASCII index masks."""
    global _TMPL_CACHE
    if _TMPL_CACHE is None:
        data = dict(np.load(TEMPLATE_PATH))
        for bad in ("I_reg", "l_c", "−_reg"):
            data.pop(bad, None)
        names = list(data.keys())
        mat = np.stack([data[k] for k in names], axis=0)
        base_chars = [k.split("_")[0] for k in names]
        is_special = np.array([bc in SPECIAL_SYMBOLS for bc in base_chars], dtype=bool)
        is_ascii_contrast = np.array(
            [bc not in SPECIAL_SYMBOLS and bc not in OP_CHARS for bc in base_chars],
            dtype=bool,
        )
        _TMPL_CACHE = (names, base_chars, mat, is_special, is_ascii_contrast)
    return _TMPL_CACHE


def get_hi_overrides():
    global _HI_CACHE
    if _HI_CACHE is None:
        if os.path.exists(EN_OVERRIDES_PATH):
            with open(EN_OVERRIDES_PATH, "r", encoding="utf-8") as f:
                _HI_CACHE = json.load(f)
        elif os.path.exists(HI_OVERRIDES_PATH):
            with open(HI_OVERRIDES_PATH, "r", encoding="utf-8") as f:
                _HI_CACHE = json.load(f)
        else:
            _HI_CACHE = {}
    return _HI_CACHE


def _rgb_class(fill):
    if not fill or len(fill) < 3:
        return "blk"
    r, g, b = fill[0], fill[1], fill[2]
    if r >= 0.72 and g >= 0.72 and b >= 0.72:
        return "light"
    if g - r > 0.15 and g > 0.35:
        return "green"
    if r - g > 0.25 and r > 0.45:
        return "red"
    return "blk"


def is_content_img(inf, page_no):
    w, h = inf["width"], inf["height"]
    if (w, h) in ICON_SIZES or (w, h) in NON_CONTENT_SIZES:
        return False
    bb = fitz.Rect(inf["bbox"])
    if bb.width < 6 or bb.height < 5:
        return False
    if w > 900 and h > 900:
        return False
    if page_no == 0 and bb.y0 < 170:
        return False
    return True


def ocr_chunk_list(ocr, chunks, batch_size=32):
    """Run RapidOCR.text_recognizer with width-sorting for high CPU throughput."""
    if not chunks:
        return []
    order = sorted(range(len(chunks)), key=lambda i: chunks[i].shape[1])
    sorted_chunks = [chunks[i] for i in order]
    out = [None] * len(chunks)
    for i in range(0, len(sorted_chunks), batch_size):
        batch = sorted_chunks[i:i + batch_size]
        rgb_list = [cv2.cvtColor(c, cv2.COLOR_GRAY2RGB) if c.ndim == 2 else c for c in batch]
        rec_res = ocr.text_recognizer(rgb_list)
        preds = rec_res[0] if isinstance(rec_res, tuple) else rec_res
        for j, item in enumerate(preds):
            if isinstance(item, (list, tuple)) and len(item) >= 2:
                pred_val = (str(item[0]), float(item[1]))
            elif isinstance(item, str):
                pred_val = (item, 1.0)
            else:
                pred_val = ("", 0.0)
            orig_idx = order[i + j]
            out[orig_idx] = pred_val
    return out


def _distinguish_div_vs_plus(p16n):
    """Differentiate '÷' from '+' using normalized ink white-gap rows above & below crossbar."""
    gt = min(float(p16n[y, 4:12].mean()) for y in range(2, 6))
    gb = min(float(p16n[y, 4:12].mean()) for y in range(10, 14))
    col_c = float(p16n[2:14, 6:10].max(axis=1).min())
    mid_bar = float(p16n[6:10, 2:14].mean())
    top_dot = float(p16n[0:4, 5:11].max())
    bot_dot = float(p16n[12:16, 5:11].max())
    if gt < 0.22 and gb < 0.22 and col_c < 0.30 and mid_bar > 0.35 and top_dot > 0.45 and bot_dot > 0.45:
        return "÷"
    return "+"


def _classify_special_glyph(r, patch, row_s, base_chars, is_ascii_contrast, y_base):
    """
    Classify a vector glyph strictly into SPECIAL_SYMBOLS only when both
    contrast margin over ASCII letters and hard geometric invariants hold.
    """
    best_k = int(np.argmax(row_s))
    best_c = float(row_s[best_k])
    sym = base_chars[best_k]

    p16 = cv2.resize(patch, (16, 16), interpolation=cv2.INTER_AREA).astype(np.float32)
    pmax = float(p16.max())
    if pmax < 1e-6:
        return None
    p16n = p16 / pmax

    ascii_scores = row_s[is_ascii_contrast]
    best_ascii_c = float(ascii_scores.max()) if len(ascii_scores) else 0.0

    # 1. Elevated superscripts: °, ², ³
    if r.y1 <= y_base - 1.35 and r.height <= 4.95:
        sup_cands = [(k, float(row_s[k])) for k, bc in enumerate(base_chars) if bc in SUPERSCRIPT_SYMS]
        if sup_cands:
            sup_best_k, sup_c = max(sup_cands, key=lambda t: t[1])
            sup_sym = base_chars[sup_best_k]
            if sup_sym == "°" and r.height <= 3.15 and r.y1 <= y_base - 1.75 and sup_c >= 0.84:
                return "°"
            if sup_sym in {"²", "³"} and sup_c >= 0.85:
                c2 = max(float(row_s[k]) for k, bc in enumerate(base_chars) if bc == "²")
                c3 = max(float(row_s[k]) for k, bc in enumerate(base_chars) if bc == "³")
                bot_bar = float(p16n[13:16, 2:14].mean())
                left_pocket = float(p16n[10:13, 1:5].mean())
                if c2 >= c3 + 0.03 and bot_bar > 0.42:
                    return "²"
                if left_pocket < 0.16 and c3 >= c2 - 0.03:
                    return "³"
                return sup_sym

    # 2. Division ÷ vs +
    if sym in {"+", "÷"} and best_c >= 0.84 and r.width >= 3.0 and r.height >= 2.8:
        if _distinguish_div_vs_plus(p16n) == "÷":
            return "÷"
        return None

    if best_c < 0.85 or sym not in SPECIAL_SYMBOLS or sym in SUPERSCRIPT_SYMS:
        return None

    # 3. Brackets { } [ ]
    if sym in {"{", "}", "[", "]"}:
        if r.height < 6.8 or r.width > 4.2 or best_c < 0.88 or best_c < best_ascii_c + 0.02:
            return None
        mid_diff = float(p16n[6:10, 8:].sum() - p16n[6:10, :8].sum())
        if sym in {"[", "]"}:
            top_bar = float(p16n[0:3, 3:13].mean())
            bot_bar = float(p16n[13:16, 3:13].mean())
            if r.width > 3.6 or top_bar < 0.35 or bot_bar < 0.35:
                return None
            return "[" if mid_diff < 0 else "]"
        return "{" if mid_diff < 0 else "}"

    # 4. Congruent modulo ≡ (triple horizontal bar, center bar solid)
    if sym == "≡":
        left_spine_min = float(p16n[2:14, 0:4].mean(axis=1).min())
        mid_bar_mean = float(p16n[6:10, 2:14].mean())
        if r.height <= 4.3 and r.width >= 3.2 and best_c >= 0.86 and left_spine_min < 0.14 and mid_bar_mean > 0.40:
            return "≡"
        return None

    # 5. Theta θ (crossbar > 0.32 distinguishes it from hollow O_reg)
    if sym == "θ":
        crossbar = float(p16n[6:10, 4:12].mean())
        top_arch = float(p16n[0:3, 5:11].mean())
        bot_arch = float(p16n[13:16, 5:11].mean())
        if r.height >= 4.2 and best_c >= 0.89 and crossbar > 0.32 and top_arch > 0.28 and bot_arch > 0.28:
            if best_c >= best_ascii_c + 0.010:
                return "θ"
        return None

    # 6. Lowercase α and accented letters ā, é, ç
    if sym == "α":
        if r.height <= 4.7 and best_c >= 0.90 and best_c >= best_ascii_c + 0.03:
            return "α"
        return None
    if sym in {"ā", "é", "ç"}:
        if best_c >= 0.89 and best_c >= best_ascii_c + 0.02:
            return sym
        return None

    # 7. Comparisons & Tilde
    if sym in {">", "<", "≤"}:
        if best_c >= 0.88 and best_c >= best_ascii_c + 0.02:
            return sym
        return None
    if sym == "~":
        return "~" if (1.2 <= r.height <= 2.5 and r.width >= 3.2 and best_c >= 0.85) else None

    # 8. Remaining geometry & currency specials: ₹, √, △, ≅, ≇, ≠, ∠
    if sym == "△" and float(p16n[13:16, 2:14].mean()) < 0.35:
        return None
    if best_c >= best_ascii_c + 0.015:
        return sym
    return None


def _decode_glyphs_direct(glyph_pairs, ink, origin_x, origin_y, y_base):
    """
    Vector fallback decoder for pure-operator lines (e.g. '÷ − × +') or narrow
    math chunks (e.g. '+ y', '.', '1') where RapidOCR drops sparse characters.
    """
    names, base_chars, tmat, _, _ = get_templates()
    ordered = sorted(glyph_pairs, key=lambda t: t[0].x0)
    if not ordered:
        return None

    out = []
    prev_x1 = None
    H, W = ink.shape
    for r, _ in ordered:
        tok = None
        if r.height <= 1.65 and 2.2 <= r.width <= 5.2:
            tok = "−"
        elif r.width <= 1.8 and r.height <= 2.2:
            tok = "." if r.y0 >= y_base - 2.0 else None
        elif r.width <= 2.0 and r.height <= 3.2 and r.y1 > y_base + 0.3:
            tok = ","
        else:
            gx0 = max(0, int(np.floor((r.x0 - origin_x) * SCALE)))
            gy0 = max(0, int(np.floor((r.y0 - origin_y) * SCALE)))
            gx1 = min(W, int(np.ceil((r.x1 - origin_x) * SCALE)))
            gy1 = min(H, int(np.ceil((r.y1 - origin_y) * SCALE)))
            if gx1 - gx0 < 2 or gy1 - gy0 < 2:
                return None
            patch = ink[gy0:gy1, gx0:gx1]
            v = cv2.resize(patch, (16, 16), interpolation=cv2.INTER_AREA).astype(np.float32).ravel()
            nrm = np.linalg.norm(v)
            if nrm < 1e-6:
                return None
            sims = (v / nrm) @ tmat.T
            k = int(np.argmax(sims))
            sc = float(sims[k])
            if sc < 0.83:
                return None
            cand = base_chars[k]
            if cand in {"+", "÷"}:
                p16 = cv2.resize(patch, (16, 16), interpolation=cv2.INTER_AREA).astype(np.float32)
                cand = _distinguish_div_vs_plus(p16 / (float(p16.max()) + 1e-9))
            elif cand == "°" and r.height >= 4.2:
                cand = "0"
            elif cand == "²" and r.y1 > y_base - 1.2:
                cand = "2"
            elif cand == "³" and r.y1 > y_base - 1.2:
                cand = "3"
            elif cand == "C2":
                cand = "C"
            tok = cand
        if tok is None:
            return None
        # In math formulas or operator options, only insert space if gap > 2.0pt
        if prev_x1 is not None and (r.x0 - prev_x1) > 2.0 and tok not in {",", "."}:
            out.append(" ")
        out.append(tok)
        prev_x1 = r.x1
    return "".join(out).strip()


def extract_page_vectors(page, ext_img_rects):
    """Extract all small glyphs & horizontal underline/blank bars across PAGE_CLIP once per page."""
    glyphs = []
    bars = []
    qboxes = []
    for d in page.get_drawings():
        r = d["rect"]
        if 215 <= r.width <= 238 and 40 <= r.height <= 65 and r.x0 > 310:
            qboxes.append(r)
            continue
        if not r.intersects(PAGE_CLIP):
            continue
        cls = _rgb_class(d.get("fill"))
        if cls == "light":
            continue
        items = d.get("items", [])
        if items and all(it[0] == "re" for it in items) and len(items) > 1:
            rects = [fitz.Rect(it[1]) for it in items]
        else:
            rects = [r]
        for rr in rects:
            if not rr.intersects(PAGE_CLIP):
                continue
            if rr.width > 420 or rr.height > 40:
                continue
            if 10.0 <= rr.width <= 380 and 0.2 <= rr.height <= 2.2:
                if not any(ir.intersects(rr) for ir in ext_img_rects):
                    bars.append(rr)
                continue
            if 0.4 <= rr.width <= 16.0 and 0.4 <= rr.height <= 16.0:
                cx, cy = (rr.x0 + rr.x1) / 2, (rr.y0 + rr.y1) / 2
                if any(ir.contains(fitz.Point(cx, cy)) for ir in ext_img_rects):
                    continue
                glyphs.append((rr, cls))
    qboxes.sort(key=lambda r: r.y0)
    return glyphs, bars, qboxes


def plan_band_decode(
    ink_strip, clip_rect, glyphs, bars, inline_imgs=None,
    debug_tag="", ocr_queue=None,
):
    """
    Build line recipes from a grayscale ink strip and queue ASCII crops into ocr_queue.
    Returns a callable resolver(preds, audit_flags) -> decoded text string.
    """
    inline_imgs = inline_imgs or []
    H, W = ink_strip.shape
    if H < 3 or W < 3:
        return lambda _preds, _flags: ""

    work = 255 - ink_strip
    ink = ink_strip.copy()

    for ir, _ in inline_imgs:
        ix0 = max(0, int(np.floor((ir.x0 - clip_rect.x0) * SCALE)) - 1)
        iy0 = max(0, int(np.floor((ir.y0 - clip_rect.y0) * SCALE)) - 1)
        ix1 = min(W, int(np.ceil((ir.x1 - clip_rect.x0) * SCALE)) + 1)
        iy1 = min(H, int(np.ceil((ir.y1 - clip_rect.y0) * SCALE)) + 1)
        work[iy0:iy1, ix0:ix1] = 255
        ink[iy0:iy1, ix0:ix1] = 0

    row_has = (ink > 28).sum(axis=1) >= 2
    lines_px = []
    in_line = False
    y_s = 0
    for y in range(H):
        if row_has[y] and not in_line:
            in_line, y_s = True, y
        elif not row_has[y] and in_line:
            if y - y_s >= 3:
                lines_px.append((y_s, y))
            in_line = False
    if in_line and H - y_s >= 3:
        lines_px.append((y_s, H))

    merged_px = []
    for y0, y1 in lines_px:
        if merged_px and y0 - merged_px[-1][1] <= int(0.9 * SCALE):
            if (y1 - merged_px[-1][0]) <= int(14.5 * SCALE):
                merged_px[-1] = (merged_px[-1][0], y1)
                continue
        merged_px.append((y0, y1))

    _, base_chars, tmat, _, is_ascii_contrast = get_templates()
    line_recipes = []

    for ly0_px, ly1_px in merged_px:
        ly0_pt = clip_rect.y0 + ly0_px / SCALE
        ly1_pt = clip_rect.y0 + ly1_px / SCALE
        line_bars = [b for b in bars if (b.y0 >= ly0_pt - 2.0 and b.y1 <= ly1_pt + 3.0)]
        blanks = []
        u_ranges = []
        line_glyphs = [
            (r, cls) for (r, cls) in glyphs
            if (r.y1 > ly0_pt - 1.0 and r.y0 < ly1_pt + 1.0)
        ]

        for b in line_bars:
            has_txt_above = any(
                r.x1 > b.x0 + 1.0 and r.x0 < b.x1 - 1.0 and r.y1 <= b.y0 + 1.8 and r.y0 >= b.y0 - 12.0
                for (r, _) in line_glyphs
            )
            if has_txt_above:
                u_ranges.append((b.x0, b.x1))
            else:
                blanks.append((b.x0, b.x1, "______"))
            bx0 = max(0, int(np.floor((b.x0 - clip_rect.x0) * SCALE)) - 1)
            bx1 = min(W, int(np.ceil((b.x1 - clip_rect.x0) * SCALE)) + 1)
            by0 = max(0, int(np.floor((b.y0 - clip_rect.y0) * SCALE)) - 1)
            by1 = min(H, int(np.ceil((b.y1 - clip_rect.y0) * SCALE)) + 2)
            work[by0:by1, bx0:bx1] = 255
            ink[by0:by1, bx0:bx1] = 0

        line_inlines = [
            (ir.x0, ir.x1, tok)
            for (ir, tok) in inline_imgs
            if ir.y1 > ly0_pt - 1.5 and ir.y0 < ly1_pt + 1.5
        ]
        if not line_glyphs and not line_bars and not line_inlines:
            continue
        tall_y1s = [r.y1 for (r, _) in line_glyphs if 4.2 <= r.height <= 9.0]
        y_base = float(np.median(tall_y1s)) if tall_y1s else ly1_pt

        # Fast-path: pure math-operator line (e.g., Q8 options '÷ − × +')
        non_dot = [g for g in line_glyphs if not (g[0].width <= 2.0 and g[0].height <= 3.2)]
        if non_dot and not blanks and not line_inlines and all(r.width <= 4.6 and r.height <= 4.6 for r, _ in non_dot):
            vec_line = _decode_glyphs_direct(line_glyphs, ink, clip_rect.x0, clip_rect.y0, y_base)
            if vec_line is not None:
                line_recipes.append(([("sym", 0.0, 1.0, vec_line, 0, None)], u_ranges))
                continue

        # Classify special vector glyphs in this line
        special_tokens = []
        cand_glyphs, cand_vecs, cand_patches = [], [], []
        for r, _cls in line_glyphs:
            if r.height <= 1.65 or (r.width < 1.9 and r.height < 6.8):
                continue
            gx0 = max(0, int(np.floor((r.x0 - clip_rect.x0) * SCALE)))
            gy0 = max(0, int(np.floor((r.y0 - clip_rect.y0) * SCALE)))
            gx1 = min(W, int(np.ceil((r.x1 - clip_rect.x0) * SCALE)))
            gy1 = min(H, int(np.ceil((r.y1 - clip_rect.y0) * SCALE)))
            if gx1 - gx0 < 2 or gy1 - gy0 < 2:
                continue
            patch = ink[gy0:gy1, gx0:gx1]
            v = cv2.resize(patch, (16, 16), interpolation=cv2.INTER_AREA).astype(np.float32).ravel()
            nrm = np.linalg.norm(v)
            if nrm < 1e-6:
                continue
            cand_glyphs.append((r, gx0, gy0, gx1, gy1))
            cand_vecs.append(v / nrm)
            cand_patches.append(patch)

        if cand_vecs:
            sims = np.stack(cand_vecs, axis=0) @ tmat.T
            for idx, (r, gx0, gy0, gx1, gy1) in enumerate(cand_glyphs):
                matched = _classify_special_glyph(r, cand_patches[idx], sims[idx], base_chars, is_ascii_contrast, y_base)
                if matched is not None:
                    special_tokens.append((r.x0, r.x1, matched))
                    work[max(0, gy0 - 1):min(H, gy1 + 1), max(0, gx0 - 1):min(W, gx1 + 1)] = 255
                    ink[max(0, gy0 - 1):min(H, gy1 + 1), max(0, gx0 - 1):min(W, gx1 + 1)] = 0

        splits = sorted(special_tokens + blanks + line_inlines, key=lambda t: t[0])

        line_ink = ink[max(0, ly0_px - 2):min(H, ly1_px + 2), :]
        col_has = (line_ink > 24).any(axis=0)
        raw_x_runs = []
        in_c, xs = False, 0
        for x in range(W):
            if col_has[x] and not in_c:
                in_c, xs = True, x
            elif not col_has[x] and in_c:
                raw_x_runs.append((xs, x))
                in_c = False
        if in_c:
            raw_x_runs.append((xs, W))

        if not raw_x_runs and not splits:
            continue

        chunks_px = []
        gap_px_thr = int(14.0 * SCALE)
        for rx0, rx1 in raw_x_runs:
            rx0_pt = clip_rect.x0 + rx0 / SCALE
            if chunks_px:
                px0, px1 = chunks_px[-1]
                px1_pt = clip_rect.x0 + px1 / SCALE
                crossed_split = any(sx0 >= px1_pt - 0.5 and sx1 <= rx0_pt + 0.5 for (sx0, sx1, _) in splits)
                if not crossed_split and (rx0 - px1) < gap_px_thr:
                    chunks_px[-1] = (px0, rx1)
                    continue
            chunks_px.append((rx0, rx1))

        py0 = max(0, ly0_px - 4)
        py1 = min(H, ly1_px + 4)
        recipe_items = []
        for cx0, cx1 in chunks_px:
            if cx1 - cx0 < 2:
                continue
            cx0_pt = clip_rect.x0 + cx0 / SCALE
            cx1_pt = clip_rect.x0 + cx1 / SCALE
            c_glyphs = [
                (gr, cls) for (gr, cls) in line_glyphs
                if gr.x1 > cx0_pt - 0.5 and gr.x0 < cx1_pt + 0.5
                and not any(sx0 <= (gr.x0 + gr.x1) / 2 <= sx1 for (sx0, sx1, _) in splits)
            ]
            if c_glyphs and (cx1_pt - cx0_pt) <= 2.4 and all(gr.width <= 2.0 and gr.height <= 3.0 for (gr, _) in c_glyphs):
                is_comma = any(gr.y1 > y_base + 0.35 or gr.height > 1.8 for (gr, _) in c_glyphs)
                recipe_items.append(("sym", cx0_pt, cx1_pt, "," if is_comma else ".", 0, None))
                continue

            vec_fb = None
            if (cx1_pt - cx0_pt) <= 18.0 or len(c_glyphs) <= 5 or (
                len(c_glyphs) <= 24
                and all(gr.width <= 3.8 for gr, _ in c_glyphs)
                and any(gr.width <= 1.2 for gr, _ in c_glyphs)
            ):
                vec_fb = _decode_glyphs_direct(c_glyphs, ink, clip_rect.x0, clip_rect.y0, y_base)

            sub = work[py0:py1, cx0:cx1]
            padded = np.pad(sub, ((3, 3), (8, 8)), mode="constant", constant_values=255)
            n_vec = sum(1 for (gr, _) in c_glyphs if not (gr.height <= 2.2 and gr.width <= 2.2))
            chunk_idx = len(ocr_queue)
            ocr_queue.append(padded)
            recipe_items.append(("ocr", cx0_pt, cx1_pt, chunk_idx, n_vec, vec_fb))

        for sx0, sx1, tok in splits:
            recipe_items.append(("sym", sx0, sx1, tok, 0, None))
        recipe_items.sort(key=lambda t: t[1])
        line_recipes.append((recipe_items, u_ranges))

    def _resolve(preds, audit_flags):
        decoded_lines = []
        for recipe_items, u_ranges in line_recipes:
            parts = []
            prev_x1 = None
            for kind, x0, x1, val, n_vec, vec_fb in recipe_items:
                if kind == "ocr":
                    txt, sc = preds[val]
                    txt = txt.strip().translate(FULLWIDTH_TRANS)
                    n_ocr = len([c for c in txt if not c.isspace() and c not in ".,;:'\"-"])
                    # Use vector fallback when RapidOCR returned empty OR dropped >=3 narrow glyphs (e.g. Roman numerals)
                    if vec_fb:
                        vec_fb_clean = re.sub(r"(?<=\))−(?=\()", "-", vec_fb)
                        if not txt:
                            txt = vec_fb_clean
                            n_ocr = len([c for c in txt if not c.isspace() and c not in ".,;:'\"-"])
                        elif sc < 0.84 and n_vec - n_ocr >= 3 and len([c for c in vec_fb_clean if not c.isspace()]) == len(c_glyphs):
                            txt = vec_fb_clean
                            n_ocr = len([c for c in txt if not c.isspace() and c not in ".,;:'\"-"])
                    if not txt:
                        if vec_fb is None and n_vec >= 1:
                            audit_flags.append(f"[{debug_tag}] EMPTY_OCR nvec={n_vec}")
                        continue
                    if n_vec >= 3 and (abs(n_vec - n_ocr) >= max(3, int(0.28 * n_vec)) or sc < 0.72):
                        audit_flags.append(f"[{debug_tag}] sc={sc:.2f} nvec={n_vec} nocr={n_ocr} '{txt}'")
                    for ux0, ux1 in u_ranges:
                        if x1 > ux0 + 2.0 and x0 < ux1 - 2.0 and x0 >= ux0 - 3.0 and x1 <= ux1 + 3.0:
                            txt = f"<u>{txt}</u>"
                            break
                    if prev_x1 is not None and (x0 - prev_x1) > 1.35:
                        if parts and not (parts[-1].endswith(("(", "[", "{", "√", "△", "∠", "²", "³", "°")) or (parts[-1] in {"+", "-", "−"} and (x0 - prev_x1) < 1.8)):
                            parts.append(" ")
                    parts.append(txt)
                    prev_x1 = x1
                else:
                    tok = val
                    if prev_x1 is not None:
                        gap = x0 - prev_x1
                        if tok in {"²", "³", "°", ".", ","}:
                            pass
                        elif tok in {"}", "]", ")"} and gap < 2.0:
                            pass
                        elif parts and parts[-1].endswith(("(", "[", "{", "√", "△", "∠", "²", "³", "°", "₹")) and gap < 2.0:
                            pass
                        elif gap >= 1.35 or tok in {"≡", "≅", "≇", "≠", "~", "÷", "______"} or tok.startswith("!["):
                            if parts and parts[-1] != " ":
                                parts.append(" ")
                    parts.append(tok)
                    prev_x1 = x1
            line_str = "".join(parts).strip()
            line_str = re.sub(r"\s{2,}", " ", line_str)
            if line_str and not re.match(r"^Section\s*:", line_str, re.I):
                decoded_lines.append(line_str)
        res_txt = "\n".join(decoded_lines)
        return SECTION_HDR_RE.sub("", res_txt, count=1).strip()

    return _resolve


def _save_clip_png(page, bbox, out_path):
    clip = fitz.Rect(bbox)
    dpi = 360 if (clip.width < 120 or clip.height < 60) else 300
    pix = page.get_pixmap(clip=clip, dpi=dpi, alpha=False)
    pix.save(out_path)
    del pix


def _extract_img_or_clip(page, inf, out_path):
    try:
        render_crisp_native_png(page, inf, out_path)
    except Exception:
        _save_clip_png(page, inf["bbox"], out_path)


def _detect_p0_icon_rows(page, y_lo, y_hi):
    clip = fitz.Rect(68, y_lo, 93, y_hi)
    pix = page.get_pixmap(clip=clip, dpi=150, alpha=False)
    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    sc = 150.0 / 72.0
    r, g, b = arr[:, :, 0].astype(np.int16), arr[:, :, 1].astype(np.int16), arr[:, :, 2].astype(np.int16)
    is_g = (g - r > 35) & (g - b > 20) & (g > 110)
    is_r = (r - g > 50) & (r - b > 35) & (r > 130)
    rows = []
    for mask, typ in ((is_g, "T"), (is_r, "X")):
        row_cnt = mask.sum(axis=1)
        in_b, s_y = False, 0
        for y in range(len(row_cnt)):
            if row_cnt[y] >= 3 and not in_b:
                in_b, s_y = True, y
            elif row_cnt[y] < 3 and in_b:
                if y - s_y >= 8:
                    rows.append((y_lo + s_y / sc, y_lo + y / sc, typ))
                in_b = False
        if in_b and len(row_cnt) - s_y >= 8:
            rows.append((y_lo + s_y / sc, y_lo + len(row_cnt) / sc, typ))
    del pix
    rows.sort(key=lambda t: t[0])
    dedup = []
    for y0, y1, tp in rows:
        if dedup and y0 - dedup[-1][0] < 6.0:
            continue
        dedup.append((y0, y1, tp))
    return dedup


def _split_stacked_opt_images(page, opt_rows, ext_imgs, slug, pno, img_counter, out_dir, url_prefix):
    consumed = set()
    opt_img_tokens = {0: [], 1: [], 2: [], 3: []}
    if len(opt_rows) != 4:
        return opt_img_tokens, consumed

    ys = [r[0] for r in opt_rows]
    cys = [(r[0] + r[1]) / 2.0 for r in opt_rows]
    bands = [
        ((ys[i - 1] + ys[i]) / 2 if i > 0 else ys[0] - 28.0,
         (ys[i] + ys[i + 1]) / 2 if i < 3 else ys[3] + 45.0)
        for i in range(4)
    ]

    for ei, inf in enumerate(ext_imgs):
        bb = fitz.Rect(inf["bbox"])
        if bb.x0 < 85:
            continue
        straddled_cys = [i for i, cy in enumerate(cys) if bb.y0 - 3.0 <= cy <= bb.y1 + 3.0]
        if len(straddled_cys) >= 2:
            consumed.add(ei)
            for oi in straddled_cys:
                bt, bb_ = bands[oi]
                sub_clip = fitz.Rect(bb.x0 - 2, max(bb.y0 - 2, bt + 1), bb.x1 + 2, min(bb.y1 + 2, bb_ - 1))
                pix = page.get_pixmap(clip=sub_clip, dpi=150, alpha=False)
                arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
                nonwhite = np.where(arr.min(axis=2) < 240)
                del pix
                if len(nonwhite[0]) > 15:
                    s_ = 150.0 / 72.0
                    ny0 = sub_clip.y0 + int(nonwhite[0].min()) / s_ - 3
                    ny1 = sub_clip.y0 + int(nonwhite[0].max()) / s_ + 3
                    nx0 = sub_clip.x0 + int(nonwhite[1].min()) / s_ - 3
                    nx1 = sub_clip.x0 + int(nonwhite[1].max()) / s_ + 3
                    img_counter[0] += 1
                    fn = f"{slug}_p{pno+1}_img{img_counter[0]}.png"
                    _save_clip_png(page, fitz.Rect(nx0, ny0, nx1, ny1), os.path.join(out_dir, fn))
                    lbl = chr(ord("A") + oi)
                    opt_img_tokens[oi].append((sub_clip.x0, f"![Option {lbl}]({url_prefix}/{fn})"))
    return opt_img_tokens, consumed


def _p0_find_sep_y(arr_150, scale, y_lo_pt, y_hi_pt, default_pt):
    """Locate card separator bar in 150-dpi grayscale p0 image between two questions."""
    py0 = max(0, int(y_lo_pt * scale))
    py1 = min(arr_150.shape[0], int(y_hi_pt * scale))
    px0, px1 = int(55 * scale), int(535 * scale)
    if py1 <= py0 or px1 <= px0:
        return default_pt
    strip = arr_150[py0:py1, px0:px1]
    frac = (strip < 225).mean(axis=1)
    cands = np.where(frac > 0.72)[0]
    if len(cands):
        # Use bottom-most full-width divider line in [y_lo_pt, y_hi_pt] right before Q.{k+1}
        return (py0 + int(cands[-1])) / scale + 2.5
    return default_pt


def _p0_slice_ocr_lines(page, clip_rect, ocr, ignore_y_ranges=(), dpi=350):
    """Slice grayscale text rows in clip_rect cleanly and OCR via ocr_chunk_list."""
    if clip_rect.y1 <= clip_rect.y0 + 2:
        return []
    pix = page.get_pixmap(clip=clip_rect, dpi=dpi, colorspace=fitz.csGRAY, alpha=False)
    g = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width).copy()
    del pix
    s = dpi / 72.0
    for iy0, iy1 in ignore_y_ranges:
        py0 = max(0, int((iy0 - clip_rect.y0) * s) - 2)
        py1 = min(g.shape[0], int((iy1 - clip_rect.y0) * s) + 2)
        if py1 > py0:
            g[py0:py1, :] = 255
    row_dark = (g < 200).sum(axis=1)
    min_h = int(6 * dpi / 300.0)
    max_h = int(48 * dpi / 300.0)
    in_r, start, strips = False, 0, []
    for y, cnt in enumerate(row_dark):
        if cnt >= 4 and not in_r:
            in_r, start = True, y
        elif cnt < 4 and in_r:
            in_r = False
            if min_h <= y - start <= max_h:
                sub = g[max(0, start - 5):min(g.shape[0], y + 5), :]
                cols = np.where((sub < 200).sum(axis=0) >= 1)[0]
                if len(cols):
                    x0, x1 = max(0, int(cols[0]) - 8), min(sub.shape[1], int(cols[-1]) + 8)
                    strips.append(np.pad(sub[:, x0:x1], ((6, 6), (12, 12)), mode="constant", constant_values=255))
    if in_r and min_h <= g.shape[0] - start <= max_h:
        sub = g[max(0, start - 5):, :]
        cols = np.where((sub < 200).sum(axis=0) >= 1)[0]
        if len(cols):
            x0, x1 = max(0, int(cols[0]) - 8), min(sub.shape[1], int(cols[-1]) + 8)
            strips.append(np.pad(sub[:, x0:x1], ((6, 6), (12, 12)), mode="constant", constant_values=255))
    if not strips:
        return []
    lines_out = []
    for t, _ in ocr_chunk_list(ocr, strips, batch_size=6):
        tc = t.strip().translate(FULLWIDTH_TRANS)
        if not tc or re.match(r"^(Section\s*:|Q\.\d+$|Ans$)", tc) or re.fullmatch(r"[\W_]+", tc):
            continue
        tc = re.sub(r"^Q\.\d+\s+", "", tc).strip()
        if tc:
            lines_out.append(tc)
    return lines_out


def extract_p0_typeB(doc, slug, out_dir, url_prefix, img_counter, ocr, audit_flags):
    """Extract 0..3 questions present on p0 of a Type B PDF using icon-anchored bounds."""
    page = doc[0]
    icons_all = _detect_p0_icon_rows(page, 175, 775)
    if not icons_all:
        return []
    if len(icons_all) % 4 != 0:
        audit_flags.append(f"[p0_icons_total] icons={len(icons_all)}")

    t0 = page.get_text("text").strip()
    has_text_layer = len(t0) > 250 and ("Question ID" in t0 or "Ans" in t0)
    ext_imgs = [inf for inf in page.get_image_info() if is_content_img(inf, 0)]
    q_blocks = []

    p0_ov_path = os.path.join(os.path.dirname(__file__), "p0_overrides_2023.json")
    p0_ov_map = {}
    if os.path.isfile(p0_ov_path):
        with open(p0_ov_path, "r", encoding="utf-8") as _pf:
            p0_ov_map = json.load(_pf)

    pix_full = page.get_pixmap(dpi=150, alpha=False)
    arr_full = np.frombuffer(pix_full.samples, dtype=np.uint8).reshape(pix_full.height, pix_full.width, pix_full.n)
    arr_gray = arr_full.min(axis=2)
    s_150 = 150.0 / 72.0

    spans = []
    qid_lines = []
    if has_text_layer:
        d_dict = page.get_text("dict")
        for blk in d_dict.get("blocks", []):
            if blk.get("type") != 0:
                continue
            for ln in blk.get("lines", []):
                for sp in ln.get("spans", []):
                    bb = fitz.Rect(sp["bbox"])
                    txt = sp["text"]
                    if bb.y0 >= 170 and txt.strip():
                        spans.append((bb, txt, sp.get("color", 0)))
        spans.sort(key=lambda s: (round(s[0].y0, 1), s[0].x0))
        if not spans or (sum(len(s[1].strip()) for s in spans) / len(spans)) <= 2.5:
            has_text_layer = False
            spans = []
        else:
            qid_lines = [(s[0].y0, m.group(1)) for s in spans for m in [re.search(r"(\d{8,12})", s[1])] if m and s[0].x0 > 330]

    n_q = len(icons_all) // 4
    for qi in range(n_q):
        grp = icons_all[4 * qi : 4 * qi + 4]
        if qi == 0:
            ys_ = 185.0
        else:
            prev_bot = icons_all[4 * qi - 1][1]
            ys_ = _p0_find_sep_y(arr_gray, s_150, prev_bot + 30.0, prev_bot + 78.0, prev_bot + 50.0)
        if qi + 1 < n_q:
            next_ys = _p0_find_sep_y(arr_gray, s_150, grp[3][1] + 30.0, grp[3][1] + 78.0, grp[3][1] + 50.0)
            y_end = next_ys - 1.5
        else:
            y_end = min(770.0, grp[3][1] + 58.0)

        ans_idx = [i for i, ic in enumerate(grp) if ic[2] == "T"]
        correct = chr(ord("A") + ans_idx[0]) if len(ans_idx) == 1 else "?"

        # Resolve Question ID from spans or cropped bottom-right box
        qid_val = next((qv for (qy, qv) in qid_lines if grp[3][1] - 5 <= qy <= grp[3][1] + 52), "")
        if not qid_val:
            pix_q = page.get_pixmap(clip=fitz.Rect(330, grp[3][1] + 4, 565, min(775, grp[3][1] + 55)), dpi=240, alpha=False)
            arr_q = np.frombuffer(pix_q.samples, dtype=np.uint8).reshape(pix_q.height, pix_q.width, pix_q.n)
            res_q, _ = ocr(arr_q)
            del pix_q
            qid_val = next((m.group(1) for _, txt, _ in (res_q or []) for m in [re.search(r"(\d{8,12})", txt)] if m), "")

        q_imgs = [inf for inf in ext_imgs if ys_ - 3 <= inf["bbox"][1] and inf["bbox"][3] <= y_end]
        opt_img_tokens, consumed = _split_stacked_opt_images(page, grp, q_imgs, slug, 0, img_counter, out_dir, url_prefix)

        stem_fig_tokens = []
        fig_y_ranges = []
        for ei, inf in enumerate(q_imgs):
            if ei in consumed:
                continue
            bb = fitz.Rect(inf["bbox"])
            cy = (bb.y0 + bb.y1) / 2
            if bb.y1 > grp[0][0] - 4 and len(grp) >= 2 and grp[1][0] - grp[0][0] > 26.0 and bb.x1 > 105:
                continue
            img_counter[0] += 1
            fn = f"{slug}_p1_img{img_counter[0]}.png"
            _extract_img_or_clip(page, inf, os.path.join(out_dir, fn))
            if bb.x0 >= 95 and cy >= grp[0][0] - 8:
                oi = min(range(len(grp)), key=lambda i: abs(cy - (grp[i][0] + grp[i][1]) / 2))
                lbl = chr(ord("A") + oi)
                opt_img_tokens[oi].append((bb.x0, f"![Option {lbl}]({url_prefix}/{fn})"))
            else:
                stem_fig_tokens.append((round(bb.y0 / 4.0) * 4.0, bb.x0, f"![Figure]({url_prefix}/{fn})"))
                fig_y_ranges.append((bb.y0, bb.y1))

        # Check rasterized inline figures in stem (e.g., Xubee Q.3 dice height >= 18pt) when no embedded stem figure
        if not stem_fig_tokens and grp[0][0] - 4 > ys_ + 10:
            sub_s = arr_gray[int(ys_ * s_150):int((grp[0][0] - 4) * s_150), int(72 * s_150):int(535 * s_150)]
            dark_rows = (sub_s < 210).sum(axis=1) >= 2
            in_r, st = False, 0
            for ry, d in enumerate(dark_rows):
                if d and not in_r:
                    in_r, st = True, ry
                elif not d and in_r:
                    in_r = False
                    if (ry - st) / s_150 >= 18.0:
                        fy0, fy1 = ys_ + st / s_150 - 3.0, ys_ + ry / s_150 + 3.0
                        cols = np.where((sub_s[st:ry, :] < 210).sum(axis=0) >= 1)[0]
                        fx0 = 72.0 + (int(cols[0]) / s_150 - 4.0 if len(cols) else 0.0)
                        fx1 = 72.0 + (int(cols[-1]) / s_150 + 4.0 if len(cols) else 250.0)
                        if fx0 >= 300.0:
                            continue
                        img_counter[0] += 1
                        fn = f"{slug}_p1_img{img_counter[0]}.png"
                        _save_clip_png(page, fitz.Rect(fx0, fy0, fx1, fy1), os.path.join(out_dir, fn))
                        stem_fig_tokens.append((round(fy0 / 4.0) * 4.0, fx0, f"![Figure]({url_prefix}/{fn})"))
                        fig_y_ranges.append((fy0, fy1))

        if has_text_layer:
            stem_lines_map = {}
            opt_texts = [[], [], [], []]
            has_opt_imgs = any(opt_img_tokens.values()) or (len(grp) >= 2 and grp[1][0] - grp[0][0] > 26.0)
            for bb, txt, _col in spans:
                if bb.y0 < ys_ - 2 or bb.y0 > y_end - 2:
                    continue
                t_st = txt.strip()
                if re.match(r"^Section\s*:", t_st) or t_st == "Ans":
                    continue
                if re.match(r"^Q\.\d+$", t_st) and bb.x0 < 75:
                    continue
                if bb.x0 < 89 and t_st in {"M", "X", "✓", "✗", "✔", "✘"}:
                    continue
                if bb.x0 > 330 and bb.y0 >= grp[-1][1]:
                    continue
                cy_s = (bb.y0 + bb.y1) / 2
                if any(fy0 - 2 <= cy_s <= fy1 + 2 for fy0, fy1 in fig_y_ranges):
                    continue
                if any(fy1 < cy_s <= fy1 + 22 for _, fy1 in fig_y_ranges) and re.search(r"Figure|Flrure|Flgure|rtJ", t_st):
                    continue
                in_opt = False
                if bb.y0 >= grp[0][0] - 5.0 and bb.x0 >= 88:
                    oi = min(range(len(grp)), key=lambda i: abs(cy_s - (grp[i][0] + grp[i][1]) / 2))
                    if abs(cy_s - (grp[oi][0] + grp[oi][1]) / 2) < 18.0:
                        in_opt = True
                        if not has_opt_imgs:
                            clean_t = re.sub(r"^\s*[1-4]\s*\.\s*", "", txt) if bb.x0 < 105 else txt
                            if clean_t.strip():
                                opt_texts[oi].append((bb.y0, bb.x0, clean_t.strip()))
                if not in_opt and bb.y0 < grp[0][0] - 3.0:
                    txt_c = re.sub(r"^\s*Q\.\d+\s+", "", txt) if (bb.x0 < 75 and abs(bb.y0 - ys_) < 8) else txt
                    if txt_c.strip() and not re.fullmatch(r"[.,'\"`~_|\\<>]+", txt_c.strip()):
                        yk = round(bb.y0 / 4.0) * 4.0
                        stem_lines_map.setdefault(yk, []).append((bb.x0, txt_c))

            # Fallback image crop if an option had neither text nor embedded image
            if any(not opt_texts[oi] and not opt_img_tokens[oi] for oi in range(4)):
                opt_x0 = 103.5
                cuts = [grp[0][0] - 32.0]
                for ci in range(3):
                    mid_y = (grp[ci][0] + grp[ci + 1][0]) / 2.0
                    w0, w1 = int((mid_y - 16.0) * s_150), int((mid_y + 16.0) * s_150)
                    row_dark = (arr_gray[w0:w1, int(opt_x0 * s_150):int(300 * s_150)] < 235).sum(axis=1)
                    zero_idxs = np.where(row_dark == 0)[0]
                    best_r = int(np.median(zero_idxs)) if len(zero_idxs) else int(np.argmin(row_dark))
                    cuts.append((w0 + best_r) / s_150)
                cuts.append(min(y_end - 6.0, grp[3][1] + 40.0))
                for oi in range(4):
                    if not opt_texts[oi] and not opt_img_tokens[oi]:
                        top_, bot_ = cuts[oi], cuts[oi + 1]
                        sub = arr_full[int(top_ * s_150):int(bot_ * s_150), int(opt_x0 * s_150):int(300 * s_150)]
                        nw = np.where(sub.min(axis=2) < 235)
                        if len(nw[0]) > 40:
                            ny0 = max(top_ + 0.5, top_ + int(nw[0].min()) / s_150 - 2.0)
                            ny1 = min(bot_ - 0.5, top_ + int(nw[0].max()) / s_150 + 2.0)
                            nx0 = opt_x0 + int(nw[1].min()) / s_150 - 3.0
                            nx1 = opt_x0 + int(nw[1].max()) / s_150 + 3.0
                            img_counter[0] += 1
                            fn = f"{slug}_p1_img{img_counter[0]}.png"
                            _save_clip_png(page, fitz.Rect(nx0, ny0, nx1, ny1), os.path.join(out_dir, fn))
                            lbl = chr(ord("A") + oi)
                            opt_img_tokens[oi].append((nx0, f"![Option {lbl}]({url_prefix}/{fn})"))

            stem_rows = [(yk, " ".join(t[1].strip() for t in sorted(segs, key=lambda x: x[0]))) for yk, segs in sorted(stem_lines_map.items())]
            stem_rows.extend((yk, tok) for yk, _, tok in stem_fig_tokens)
            stem_rows.sort(key=lambda t: t[0])
            stem_text = re.sub(r"^Q\.\d+\s+", "", "\n".join(r[1] for r in stem_rows).strip()).strip()
            opts = []
            for oi in range(4):
                t_str = " ".join(t[2] for t in sorted(opt_texts[oi], key=lambda t: (t[0], t[1]))).strip()
                i_str = " ".join(t[1] for t in sorted(opt_img_tokens[oi], key=lambda t: t[0])).strip()
                opts.append(f"{t_str} {i_str}".strip() if (t_str and i_str) else (t_str or i_str))
        else:
            # Image-only rasterized p0 (e.g., F59t, Ujut) using line slicing + padded option crops
            s_lines = _p0_slice_ocr_lines(page, fitz.Rect(68, ys_, 550, grp[0][0] - 4), ocr, ignore_y_ranges=fig_y_ranges)
            if not s_lines and not stem_fig_tokens:
                # Fallback full block OCR with white border padding
                pix_s = page.get_pixmap(clip=fitz.Rect(68, ys_, 550, grp[0][0] - 4), dpi=300, alpha=False)
                arr_s = np.pad(np.frombuffer(pix_s.samples, dtype=np.uint8).reshape(pix_s.height, pix_s.width, pix_s.n), ((24, 24), (24, 24), (0, 0)), mode="constant", constant_values=255)
                del pix_s
                res_s, _ = ocr(arr_s)
                for _, txt, _ in sorted((res_s or []), key=lambda it: it[0][0][1]):
                    tc = re.sub(r"^Q\.\d+\s+", "", txt.strip().translate(FULLWIDTH_TRANS)).strip()
                    if tc and not re.match(r"^(Section\s*:|Q\.\d+$|Ans$)", tc):
                        s_lines.append(tc)
            stem_parts = s_lines + [tok for _, _, tok in sorted(stem_fig_tokens, key=lambda t: t[0])]
            stem_text = "\n".join(stem_parts).strip()

            opt_crops = []
            for oy0, oy1, _ in grp:
                pix_o = page.get_pixmap(clip=fitz.Rect(93, oy0 - 3, 520, oy1 + 4), dpi=350, colorspace=fitz.csGRAY, alpha=False)
                arr_o = np.frombuffer(pix_o.samples, dtype=np.uint8).reshape(pix_o.height, pix_o.width).copy()
                del pix_o
                cols = np.where((arr_o < 200).sum(axis=0) >= 1)[0]
                if len(cols):
                    arr_o = arr_o[:, max(0, int(cols[0]) - 4):min(arr_o.shape[1], int(cols[-1]) + 6)]
                opt_crops.append(np.pad(arr_o, ((6, 6), (12, 12)), mode="constant", constant_values=255))
            o_raw = [re.sub(r"^[\.,:;]*\s*[1-4I]\s*[\.,:]+\s*", "", t.strip().translate(FULLWIDTH_TRANS)).strip() for t, _ in ocr_chunk_list(ocr, opt_crops, batch_size=4)]
            opts = []
            for oi in range(4):
                i_str = " ".join(t[1] for t in sorted(opt_img_tokens[oi], key=lambda t: t[0])).strip()
                t_str = o_raw[oi]
                opts.append(f"{t_str} {i_str}".strip() if (t_str and i_str) else (t_str or i_str))

        qb_item = {
            "question_id": qid_val, "question_text": stem_text,
            "option_a": opts[0], "option_b": opts[1], "option_c": opts[2], "option_d": opts[3],
            "correct_answer": correct, "p0": True,
        }
        ov_entry = p0_ov_map.get(f"{slug}::Q{qi+1}") or (p0_ov_map.get(qid_val) if qid_val else None)
        if ov_entry:
            fig_tok_str = "\n".join(tok for _, _, tok in sorted(stem_fig_tokens, key=lambda t: t[0]))
            for k in ("question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer"):
                if k in ov_entry:
                    val = ov_entry[k]
                    if k == "question_text" and "{FIG}" in val:
                        val = val.replace("{FIG}", fig_tok_str)
                    qb_item[k] = val
        q_blocks.append(qb_item)

    del pix_full
    return q_blocks


def _plan_qblock(slices, page_cache, slug, out_dir, url_prefix, img_counter, ocr_queue, qid_val):
    last_pno = slices[-1][1]
    all_icons = []
    slice_imgs = []
    for si, (_pg, pno, yt, yb, _qb) in enumerate(slices):
        pc = page_cache[pno]
        c_imgs, s_icons = [], []
        for inf in pc["imgs"]:
            bb = fitz.Rect(inf["bbox"])
            if bb.y1 <= yt - 2 or bb.y0 >= yb + 2:
                continue
            if (inf["width"], inf["height"]) in ICON_SIZES and 66 <= bb.x0 <= 92:
                s_icons.append((si, inf, bb, (inf["width"], inf["height"]) in TICK_SIZES))
            elif is_content_img(inf, pno):
                c_imgs.append(inf)
        s_icons.sort(key=lambda t: t[2].y0)
        all_icons.extend(s_icons)
        slice_imgs.append(c_imgs)

    icon_flag = None
    if len(all_icons) != 4:
        icon_flag = f"[{slug} p{last_pno+1} qid={qid_val}] icon_count={len(all_icons)}"

    tick_indices = [i for i, ic in enumerate(all_icons) if ic[3]]
    correct = chr(ord("A") + tick_indices[0]) if len(tick_indices) == 1 else "?"

    stem_plans = []
    opt_plans = [[], [], [], []]
    color_flags = []

    for si, (pg, pno, yt, yb, qb) in enumerate(slices):
        pc = page_cache[pno]
        ink_page = pc["ink"]
        c_imgs = slice_imgs[si]
        s_icons = [ic for ic in all_icons if ic[0] == si]
        glyphs = [
            (r, c) for (r, c) in pc["glyphs"]
            if r.y1 >= yt - 2 and r.y0 <= yb + 2
            and not any(fitz.Rect(inf["bbox"]).contains(fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)) for inf in c_imgs)
            and (qb is None or not (r.x0 >= qb.x0 - 4 and r.y0 >= qb.y0 - 4))
        ]
        bars = [
            b for b in pc["bars"]
            if yt - 2 <= b.y0 <= yb + 2
            and not any(fitz.Rect(inf["bbox"]).intersects(b) for inf in c_imgs)
        ]

        for _, _, ibb, is_tk in s_icons:
            icy = (ibb.y0 + ibb.y1) / 2
            cols = [c for (r, c) in glyphs if abs((r.y0 + r.y1) / 2 - icy) <= 6.5 and 88 <= r.x0 <= 150 and c in {"green", "red"}]
            if cols:
                has_g, has_r = "green" in cols, "red" in cols
                if is_tk and has_r and not has_g:
                    color_flags.append(f"[{slug} p{pno+1} qid={qid_val}] COLOR_MISMATCH tick vs red!")
                elif (not is_tk) and has_g and not has_r:
                    color_flags.append(f"[{slug} p{pno+1} qid={qid_val}] COLOR_MISMATCH cross vs green!")

        opt_global_idxs = [gi for gi, ic in enumerate(all_icons) if ic[0] == si]
        opt_row_tuples = [(ic[2].y0, ic[2].y1, "T" if ic[3] else "X") for ic in s_icons]
        consumed_imgs = set()
        if len(s_icons) == 4:
            stacked_toks, consumed_imgs = _split_stacked_opt_images(pg, opt_row_tuples, c_imgs, slug, pno, img_counter, out_dir, url_prefix)
            for loc_i, toks in stacked_toks.items():
                for _, tok in toks:
                    opt_plans[opt_global_idxs[loc_i]].append((s_icons[loc_i][2].y0, lambda _p, _f, t=tok: t))

        if not s_icons:
            stem_y_bot, opt_ranges = yb, []
        else:
            first_icy = (s_icons[0][2].y0 + s_icons[0][2].y1) / 2
            stem_min_end = max((r.y1 for (r, _) in glyphs if r.x0 < 88.5 and r.y0 < first_icy - 2), default=yt)
            icon_cys = [(ic[2].y0 + ic[2].y1) / 2 for ic in s_icons]
            opt1_top = min(s_icons[0][2].y0 - 4.0, first_icy - 9.0)
            for ei, inf in enumerate(c_imgs):
                if ei in consumed_imgs:
                    continue
                ibb = fitz.Rect(inf["bbox"])
                if ibb.x0 >= 95 and abs((ibb.y0 + ibb.y1) / 2 - first_icy) <= 10.0 and ibb.y0 >= stem_min_end - 2:
                    opt1_top = min(opt1_top, ibb.y0 - 2.0)
            stem_y_bot = opt1_top
            opt_ranges = [
                (g_i,
                 (icon_cys[li - 1] + icon_cys[li]) / 2 if li > 0 else opt1_top,
                 (icon_cys[li] + icon_cys[li + 1]) / 2 if li < len(s_icons) - 1 else yb)
                for li, g_i in enumerate(opt_global_idxs)
            ]

        stem_ext, stem_inline = [], []
        opt_ext = {gi: [] for (gi, _, _) in opt_ranges}
        for ei, inf in enumerate(c_imgs):
            if ei in consumed_imgs:
                continue
            ibb = fitz.Rect(inf["bbox"])
            cy = (ibb.y0 + ibb.y1) / 2
            assigned_opt = next((gi for gi, ot, ob in opt_ranges if ot - 1.5 <= cy <= ob + 1.5 and ibb.x0 >= 92), None)
            if assigned_opt is None and cy >= stem_y_bot and opt_ranges:
                assigned_opt = min(opt_ranges, key=lambda t: abs(cy - (t[1] + t[2]) / 2))[0]

            img_counter[0] += 1
            fn = f"{slug}_p{pno+1}_img{img_counter[0]}.png"
            _extract_img_or_clip(pg, inf, os.path.join(out_dir, fn))

            if assigned_opt is not None:
                lbl = chr(ord("A") + assigned_opt)
                has_opt_txt = any(r.y1 > ibb.y0 - 2 and r.y0 < ibb.y1 + 2 and r.x0 >= 99 and (r.x1 < ibb.x0 - 2 or r.x0 > ibb.x1 + 2) for (r, _) in glyphs)
                tok = f"![Inline]({url_prefix}/{fn})" if (has_opt_txt and ibb.height <= 38) else f"![Option {lbl}]({url_prefix}/{fn})"
                opt_ext[assigned_opt].append((ibb, tok))
            else:
                has_side_txt = any(r.y1 > ibb.y0 - 2 and r.y0 < ibb.y1 + 2 and 68 <= r.x0 and (r.x1 < ibb.x0 - 2 or r.x0 > ibb.x1 + 2) for (r, _) in glyphs)
                if has_side_txt and ibb.height <= 38 and ibb.width <= 95:
                    stem_inline.append((ibb, f"![Inline]({url_prefix}/{fn})"))
                else:
                    stem_ext.append((ibb.y0, f"![Figure]({url_prefix}/{fn})"))

        def _slice_ink(rect):
            ry0 = max(0, int(np.floor((rect.y0 - PAGE_CLIP.y0) * SCALE)))
            ry1 = min(ink_page.shape[0], int(np.ceil((rect.y1 - PAGE_CLIP.y0) * SCALE)))
            rx0 = max(0, int(np.floor((rect.x0 - PAGE_CLIP.x0) * SCALE)))
            rx1 = min(ink_page.shape[1], int(np.ceil((rect.x1 - PAGE_CLIP.x0) * SCALE)))
            return ink_page[ry0:ry1, rx0:rx1].copy()

        if stem_y_bot > yt + 3:
            s_end = min(stem_y_bot, yb)
            s_glyphs = [(r, c) for (r, c) in glyphs if r.y0 < s_end - 0.5]
            s_bars = [b for b in bars if b.y0 < s_end - 0.5]
            standalone_figs = sorted(
                [inf for ei, inf in enumerate(c_imgs)
                 if ei not in consumed_imgs and fitz.Rect(inf["bbox"]).y0 < s_end
                 and not any(fitz.Rect(inf["bbox"]).intersects(ir) for (ir, _) in stem_inline)],
                key=lambda inf: inf["bbox"][1],
            )
            cur_y = yt
            for inf in standalone_figs:
                fr = fitz.Rect(inf["bbox"])
                if fr.y0 > cur_y + 3:
                    b_rect = fitz.Rect(68.0, cur_y, 550.0, fr.y0)
                    bg = [(r, c) for (r, c) in s_glyphs if r.y0 >= cur_y - 1 and r.y1 <= fr.y0 + 1]
                    bb_ = [b for b in s_bars if cur_y - 1 <= b.y0 <= fr.y0 + 1]
                    if bg or stem_inline:
                        stem_plans.append(plan_band_decode(
                            _slice_ink(b_rect), b_rect, bg, bb_,
                            inline_imgs=stem_inline, debug_tag=f"{slug[:8]} p{pno+1} {qid_val}", ocr_queue=ocr_queue,
                        ))
                tok_m = next((tk for (iy, tk) in stem_ext if abs(iy - fr.y0) < 1.0), None)
                if tok_m:
                    stem_plans.append(lambda _p, _f, t=tok_m: t)
                cur_y = max(cur_y, fr.y1)
            if s_end > cur_y + 3:
                b_rect = fitz.Rect(68.0, cur_y, 550.0, s_end)
                bg = [(r, c) for (r, c) in s_glyphs if r.y0 >= cur_y - 1]
                bb_ = [b for b in s_bars if b.y0 >= cur_y - 1]
                if bg or stem_inline:
                    stem_plans.append(plan_band_decode(
                        _slice_ink(b_rect), b_rect, bg, bb_,
                        inline_imgs=stem_inline, debug_tag=f"{slug[:8]} p{pno+1} {qid_val}", ocr_queue=ocr_queue,
                    ))

        for gi, ot, ob in opt_ranges:
            x_opt_left = 99.0
            o_rect = fitz.Rect(x_opt_left, ot, 550.0, ob)
            o_glyphs = [
                (r, c) for (r, c) in glyphs
                if r.x1 > x_opt_left - 0.5 and r.y1 > ot - 1 and r.y0 < ob + 1
                and (qb is None or r.x0 < qb.x0 - 4 or r.y0 < qb.y0 - 4)
            ]
            o_bars = [b for b in bars if b.x1 > x_opt_left and ot - 1 <= b.y0 <= ob + 1]
            ex_list = opt_ext[gi]
            inline_opt = [(bb, tk) for (bb, tk) in ex_list if tk.startswith("![Inline]")]
            pure_opt = [tk for (bb, tk) in ex_list if not tk.startswith("![Inline]")]
            txt_res = (
                plan_band_decode(
                    _slice_ink(o_rect), o_rect, o_glyphs, o_bars,
                    inline_imgs=inline_opt, debug_tag=f"{slug[:8]} p{pno+1} {qid_val} opt{gi+1}",
                    ocr_queue=ocr_queue,
                )
                if o_glyphs else (lambda _p, _f: "")
            )
            # Local fallback helper for bare single-digit options ('1') or misread single chars
            def _make_eval(tr, po, gi_local=gi, ot_local=ot, ob_local=ob, s_icons_local=s_icons, pg_local=pg):
                def _opt_eval(preds, flags):
                    t = tr(preds, flags)
                    needs_pref = (
                        not po
                        and (
                            not t
                            or t in {"$", "|", "!", "l", "I", ":", ";", ".", ",", "'", '"', "_"}
                            or (
                                len(t) <= 2
                                and not any(ch.isalnum() for ch in t)
                                and t not in SPECIAL_SYMBOLS
                                and t not in OP_CHARS
                            )
                        )
                    )
                    if needs_pref:
                        orig_t = t
                        clip_pref = fitz.Rect(89.5, ot_local, min(140.0, 550.0), ob_local)
                        pix_pref = pg_local.get_pixmap(clip=clip_pref, dpi=300, colorspace=fitz.csGRAY, alpha=False)
                        arr_pref = np.frombuffer(pix_pref.samples, dtype=np.uint8).reshape(pix_pref.height, pix_pref.width).copy()
                        del pix_pref
                        res_p = ocr_chunk_list(get_ocr(), [np.pad(arr_pref, ((4,4),(10,10)), mode="constant", constant_values=255)])
                        if res_p:
                            ptxt = res_p[0][0].strip().translate(FULLWIDTH_TRANS)
                            cand = re.sub(r"^[^\w]*[1-4I]\s*[\.,:]?\s*", "", ptxt).strip()
                            if cand:
                                t = cand
                            else:
                                t = orig_t
                    # Normalize lone Latin 'o'/'O' to digit '0' when option is single character
                    if t in {"o", "O"}:
                        t = "0"
                    if t and po:
                        return f"{t} {' '.join(po)}"
                    return " ".join(po) if po else t
                return _opt_eval
            opt_plans[gi].append((ot, _make_eval(txt_res, pure_opt)))

    def _finalize(preds, audit_flags):
        if icon_flag:
            audit_flags.append(icon_flag)
        audit_flags.extend(color_flags)
        stem_parts = [fn(preds, audit_flags) for fn in stem_plans]
        q_text = "\n".join(p for p in stem_parts if p).strip()
        q_text = SECTION_HDR_RE.sub("", q_text).strip()
        opts = []
        for gi in range(4):
            s_chunks = [fn(preds, audit_flags) for _, fn in sorted(opt_plans[gi], key=lambda t: t[0])]
            opts.append(" ".join(c for c in s_chunks if c).strip())
        return {
            "question_id": qid_val,
            "question_text": q_text,
            "option_a": opts[0], "option_b": opts[1], "option_c": opts[2], "option_d": opts[3],
            "correct_answer": correct,
        }

    return _finalize


def parse_type_b_pdf(pdf_path, slug, out_dir, url_prefix):
    """Extract all 100 questions from a Type B 2023 PDF using batched ONNX inference & page caching."""
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    ocr = get_ocr()
    img_counter = [0]
    audit_flags = []

    all_slots = []
    for q0 in extract_p0_typeB(doc, slug, out_dir, url_prefix, img_counter, ocr, audit_flags):
        all_slots.append(("direct", q0))

    pages_meta = {}
    qblock_list = []
    qid_crops = []
    pending_slices = []

    for pno in range(1, len(doc)):
        page = doc[pno]
        imgs = page.get_image_info()
        ext_rects = [fitz.Rect(inf["bbox"]) for inf in imgs if is_content_img(inf, pno)]
        glyphs, bars, qboxes = extract_page_vectors(page, ext_rects)
        pages_meta[pno] = {"imgs": imgs, "glyphs": glyphs, "bars": bars, "qboxes": qboxes}

        y_cursor = 26.0
        for qb in qboxes:
            slices = pending_slices + [(page, pno, y_cursor, qb.y1 + 2.0, qb)]
            pending_slices = []
            qclip = fitz.Rect(qb.x0 + 40.0, qb.y0 + 3.0, qb.x1 - 3.0, qb.y0 + 17.5)
            pix_q = page.get_pixmap(clip=qclip, dpi=240, colorspace=fitz.csGRAY, alpha=False)
            arr_q = np.frombuffer(pix_q.samples, dtype=np.uint8).reshape(pix_q.height, pix_q.width).copy()
            del pix_q
            qid_idx = len(qid_crops)
            qid_crops.append(arr_q)
            slot_idx = len(all_slots)
            all_slots.append(("pending", None))
            qblock_list.append((slot_idx, slices, qid_idx, qb, page))
            y_cursor = qb.y1 + 3.0

        trail_rect = fitz.Rect(45, y_cursor, 555, 768)
        has_trail_draw = any(r.intersects(trail_rect) for r, _ in glyphs)
        has_trail_img = any(
            fitz.Rect(inf["bbox"]).y1 > y_cursor + 2 and fitz.Rect(inf["bbox"]).y0 < 765
            and (is_content_img(inf, pno) or (inf["width"], inf["height"]) in ICON_SIZES)
            for inf in imgs
        )
        if has_trail_draw or has_trail_img:
            pix_t = page.get_pixmap(clip=trail_rect, dpi=150, colorspace=fitz.csGRAY, alpha=False)
            arr_t = np.frombuffer(pix_t.samples, dtype=np.uint8).reshape(pix_t.height, pix_t.width)
            dark_cnt = int((arr_t < 200).sum())
            del pix_t
            if dark_cnt > 35:
                pending_slices.append((page, pno, y_cursor, 768.0, None))
        fitz.TOOLS.store_shrink(100)

    if pending_slices:
        audit_flags.append(f"[{slug}] LEFTOVER trailing pending_slices={len(pending_slices)}")

    import time as _tq
    _tq0 = _tq.time()
    qid_preds = ocr_chunk_list(ocr, qid_crops, batch_size=6)
    qids_resolved = {}
    hi_ov = get_hi_overrides()
    _rq2_fb = 0
    for slot_idx, _slices, qid_idx, qb, last_pg in qblock_list:
        txt_q = (qid_preds[qid_idx][0] if qid_idx < len(qid_preds) else "").replace(" ", "")
        m = re.search(r"(26433\d{4,7})", txt_q) or re.search(r":(\d{9,12})", txt_q)
        if not m:
            _rq2_fb += 1
            pix_q2 = last_pg.get_pixmap(clip=fitz.Rect(qb.x0 + 4, qb.y0 + 2, qb.x1 - 4, qb.y1 - 2), dpi=240, alpha=False)
            arr_q2 = np.frombuffer(pix_q2.samples, dtype=np.uint8).reshape(pix_q2.height, pix_q2.width, pix_q2.n)
            rq2, _ = ocr(arr_q2)
            del pix_q2
            for _, tq, _ in (rq2 or []):
                mm = re.search(r"(26433\d{4,7})", tq.replace(" ", ""))
                if mm:
                    m = mm
                    break
        qid_val = m.group(1) if m else ""
        qids_resolved[slot_idx] = qid_val
    print(f"  [TypeB QIDs] count={len(qid_crops)} rq2_fallback={_rq2_fb} done in {_tq.time() - _tq0:.1f}s")

    ocr_queue = []
    finalizers = []
    ref_counts = {}
    for slot_idx, slices, _, _, _ in qblock_list:
        if qids_resolved[slot_idx] in hi_ov:
            continue
        for _, pno, _, _, _ in slices:
            ref_counts[pno] = ref_counts.get(pno, 0) + 1

    page_cache = {}
    for slot_idx, slices, _, _, _ in qblock_list:
        qid_val = qids_resolved[slot_idx]
        if qid_val and qid_val in hi_ov:
            ov = hi_ov[qid_val]
            all_slots[slot_idx] = ("direct", {
                "question_id": qid_val, "question_text": ov["question_text"],
                "option_a": ov["option_a"], "option_b": ov["option_b"],
                "option_c": ov["option_c"], "option_d": ov["option_d"],
                "correct_answer": ov["correct_answer"],
            })
            continue
        for _pg, pno, _, _, _ in slices:
            if pno not in page_cache:
                pix_p = doc[pno].get_pixmap(clip=PAGE_CLIP, dpi=DPI, colorspace=fitz.csGRAY, alpha=False)
                ink_p = np.empty((pix_p.height, pix_p.width), dtype=np.uint8)
                np.subtract(255, np.frombuffer(pix_p.samples, dtype=np.uint8).reshape(pix_p.height, pix_p.width), out=ink_p)
                del pix_p
                pm = pages_meta[pno]
                h_px, w_px = ink_p.shape

                def _erase_ink_rect(rc, pad_l=1.5, pad_t=1.5, pad_r=1.5, pad_b=1.5):
                    y0 = max(0, int(np.floor((rc.y0 - pad_t - PAGE_CLIP.y0) * SCALE)))
                    y1 = min(h_px, int(np.ceil((rc.y1 + pad_b - PAGE_CLIP.y0) * SCALE)))
                    x0 = max(0, int(np.floor((rc.x0 - pad_l - PAGE_CLIP.x0) * SCALE)))
                    x1 = min(w_px, int(np.ceil((rc.x1 + pad_r - PAGE_CLIP.x0) * SCALE)))
                    if y1 > y0 and x1 > x0:
                        ink_p[y0:y1, x0:x1] = 0

                qboxes_p = list(pm.get("qboxes", []))
                for drw in doc[pno].get_drawings():
                    rr = drw["rect"]
                    if rr.width > 480.0 and rr.height <= 3.0:
                        _erase_ink_rect(rr, 1.5, 1.5, 1.5, 1.5)
                    elif rr.width > 480.0 and rr.height > 20.0 and drw.get("fill") is None and drw.get("color") is not None:
                        _erase_ink_rect(fitz.Rect(rr.x0, rr.y0, rr.x1, rr.y0), 2.0, 2.0, 2.0, 2.0)
                        _erase_ink_rect(fitz.Rect(rr.x0, rr.y1, rr.x1, rr.y1), 2.0, 2.0, 2.0, 2.0)
                        _erase_ink_rect(fitz.Rect(rr.x0, rr.y0, rr.x0, rr.y1), 2.0, 2.0, 2.0, 2.0)
                        _erase_ink_rect(fitz.Rect(rr.x1, rr.y0, rr.x1, rr.y1), 2.0, 2.0, 2.0, 2.0)
                    elif 200.0 <= rr.width <= 260.0 and 35.0 <= rr.height <= 60.0 and rr.x0 >= 325.0:
                        if not any(abs(rr.y0 - q.y0) < 1.0 and abs(rr.x0 - q.x0) < 1.0 for q in qboxes_p):
                            qboxes_p.append(rr)

                for qb_r in qboxes_p:
                    _erase_ink_rect(qb_r, 1.0, 1.0, 2.0, 2.0)

                qb_padded = [fitz.Rect(q.x0 - 1.0, q.y0 - 1.0, q.x1 + 2.0, q.y1 + 2.0) for q in qboxes_p]
                glyphs_clean = [
                    (gr, cls) for (gr, cls) in pm["glyphs"]
                    if not any(qp.contains(fitz.Point((gr.x0 + gr.x1) * 0.5, (gr.y0 + gr.y1) * 0.5)) for qp in qb_padded)
                ]
                page_cache[pno] = {"ink": ink_p, "glyphs": glyphs_clean, "bars": pm["bars"], "imgs": pm["imgs"]}

        fin = _plan_qblock(slices, page_cache, slug, out_dir, url_prefix, img_counter, ocr_queue, qid_val)
        finalizers.append((slot_idx, fin))

        for _, pno, _, _, _ in slices:
            ref_counts[pno] -= 1
            if ref_counts[pno] <= 0:
                page_cache.pop(pno, None)
                fitz.TOOLS.store_shrink(100)

    page_cache.clear()
    import time as _t
    _t_ocr0 = _t.time()
    all_preds = ocr_chunk_list(ocr, ocr_queue, batch_size=6)
    _t_fin0 = _t.time()
    print(f"  [TypeB OCR] crops={len(ocr_queue)} done in {_t_fin0 - _t_ocr0:.1f}s")
    for slot_idx, fin in finalizers:
        all_slots[slot_idx] = ("direct", fin(all_preds, audit_flags))

    doc.close()
    gc.collect()

    cleaned = []
    for idx, (_kind, q) in enumerate(all_slots, 1):
        qt = re.sub(r"^\s*Q\.\s*\d+\s*", "", q["question_text"]).strip()
        sec = (
            "General Intelligence and Reasoning" if idx <= 25 else
            "General Awareness" if idx <= 50 else
            "Quantitative Aptitude" if idx <= 75 else
            "English Comprehension"
        )
        cleaned.append({
            "question_number": idx,
            "question_id": q["question_id"],
            "section": sec,
            "question_text": qt,
            "option_a": q["option_a"],
            "option_b": q["option_b"],
            "option_c": q["option_c"],
            "option_d": q["option_d"],
            "correct_answer": q["correct_answer"],
            "explanation": "",
        })
    print(f"  [TypeB Finalize] {_t.time() - _t_fin0:.1f}s")
    return cleaned, audit_flags
