import fitz
import re
import os

input_pdf = r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf"
output_dir = r"E:\pyq pdf"
final_output_pdf = os.path.join(output_dir, "SSC_CGL_2025_Tier_1_12_Sept_Shift_1_SSC_ZONE.pdf")
temp_clean_pdf = "tmp/intermediate_clean.pdf"

print("--- Step 1: Cleaning banners, watermarks, and links from original streams ---")
doc = fitz.open(input_pdf)

for pno in range(2, len(doc)):
    page = doc[pno]
    p_obj = doc.xref_object(page.xref)
    
    # 1. Clean outer stream (remove /Image-... Do)
    contents_match = re.search(r'/Contents\s*(?:\[\s*(\d+)\s+0\s+R\s*\]|(\d+)\s+0\s+R)', p_obj)
    if contents_match:
        outer_xref = int(contents_match.group(1) or contents_match.group(2))
        outer_stream = doc.xref_stream(outer_xref).decode('latin1', errors='ignore')
        cleaned_outer = re.sub(r'/Image-[^\s]+\s+Do', '% Do', outer_stream)
        doc.update_stream(outer_xref, cleaned_outer.encode('latin1'))
    
    # 2. Clean inner form stream (remove /X4 Do)
    embedded_match = re.search(r'/EmbeddedPdfPage[^\s]+\s+(\d+)\s+0\s+R', p_obj)
    if embedded_match:
        embed_xref = int(embedded_match.group(1))
        inner_stream = doc.xref_stream(embed_xref).decode('latin1', errors='ignore')
        cleaned_inner = inner_stream.replace('/X4 Do', '%/X4 Do')
        doc.update_stream(embed_xref, cleaned_inner.encode('latin1'))
    
    # 3. Clean Annots (Testbook links)
    doc.xref_set_key(page.xref, "Annots", "null")

# Delete old cover and testbook promo pages (0 and 1)
doc.delete_pages([0, 1])
os.makedirs("tmp", exist_ok=True)
doc.save(temp_clean_pdf, garbage=4, deflate=True)
doc.close()
print(f"Step 1 finished. Saved {temp_clean_pdf}")

print("--- Step 2: Adding SSC Zone Header, Footer & Faint Watermark ---")
doc = fitz.open(temp_clean_pdf)
total_content_pages = len(doc)
print(f"Total content pages: {total_content_pages}")

for idx, page in enumerate(doc, start=1):
    # Faint watermark (very light gray, never obstructive)
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
        "SSC CGL 2025 Tier-I | Held on 12 Sept 2025 (Shift 1)",
        fontsize=8.5,
        fontname="helv",
        color=(0.3, 0.35, 0.45)
    )
    page.insert_text(
        fitz.Point(475, 38),
        "SSC ZONE",
        fontsize=9,
        fontname="helv",
        color=(0.15, 0.35, 0.75)
    )
    
    # Footer line & text
    page.draw_line(fitz.Point(35, 796), fitz.Point(560, 796), color=(0.82, 0.86, 0.90), width=0.75)
    page.insert_text(
        fitz.Point(35, 809),
        "SSC ZONE — Free Practice & Mock Tests (ssczone.in)",
        fontsize=8,
        fontname="helv",
        color=(0.4, 0.45, 0.55)
    )
    page_str = f"Page {idx} of {total_content_pages}"
    page.insert_text(
        fitz.Point(275, 809),
        page_str,
        fontsize=8,
        fontname="helv",
        color=(0.3, 0.35, 0.45)
    )
    page.insert_text(
        fitz.Point(495, 809),
        "www.ssczone.in",
        fontsize=8,
        fontname="helv",
        color=(0.15, 0.35, 0.75)
    )

print("--- Step 3: Generating Executive Front Cover Page ---")
cover_doc = fitz.open()
cover_page = cover_doc.new_page(width=595, height=842)

# Colors
DARK_NAVY = (15/255, 23/255, 42/255)       # #0F172A
ROYAL_BLUE = (37/255, 99/255, 235/255)     # #2563EB
LIGHT_SLATE = (248/255, 250/255, 252/255)  # #F8FAFC
CARD_BG = (1, 1, 1)
BORDER_COLOR = (226/255, 232/255, 240/255) # #E2E8F0
TEXT_DARK = (30/255, 41/255, 59/255)
TEXT_MUTED = (100/255, 116/255, 139/255)
GOLD_ACCENT = (217/255, 119/255, 6/255)

# Background
cover_page.draw_rect(fitz.Rect(0, 0, 595, 842), color=None, fill=LIGHT_SLATE)

# Top Header Block
cover_page.draw_rect(fitz.Rect(0, 0, 595, 135), color=None, fill=DARK_NAVY)
cover_page.draw_rect(fitz.Rect(0, 135, 595, 140), color=None, fill=ROYAL_BLUE)

# Logo
logo_path = r"C:\ssczone\public\icon-512.png"
if os.path.exists(logo_path):
    cover_page.insert_image(fitz.Rect(40, 30, 115, 105), filename=logo_path)

cover_page.insert_text(fitz.Point(125, 58), "SSC ZONE", fontsize=26, fontname="helv", color=(1, 1, 1))
cover_page.insert_text(fitz.Point(125, 78), "INDIA'S DEDICATED SSC PREPARATION PLATFORM", fontsize=9, fontname="helv", color=(0.7, 0.8, 1))
cover_page.insert_text(fitz.Point(125, 96), "Free Mock Tests | Previous Year Papers | Chapterwise Practice", fontsize=8.5, fontname="helv", color=(0.85, 0.85, 0.9))

# Exam Title Box (Card)
cover_page.draw_rect(fitz.Rect(40, 160, 555, 265), color=BORDER_COLOR, fill=CARD_BG, width=1)
cover_page.draw_rect(fitz.Rect(40, 160, 46, 265), color=None, fill=ROYAL_BLUE) # Accent left edge

cover_page.insert_text(fitz.Point(60, 188), "STAFF SELECTION COMMISSION (SSC)", fontsize=11, fontname="helv", color=GOLD_ACCENT)
cover_page.insert_text(fitz.Point(60, 216), "SSC CGL 2025 Tier-I Official Paper", fontsize=18, fontname="helv", color=DARK_NAVY)
cover_page.insert_text(fitz.Point(60, 238), "Held On: 12 September, 2025  |  Shift: Shift 1 (09:00 AM – 10:00 AM)", fontsize=10, fontname="helv", color=TEXT_MUTED)
cover_page.insert_text(fitz.Point(60, 254), "Bilingual Paper (English & Hindi)  •  Official Answer Key Included", fontsize=9.5, fontname="helv", color=ROYAL_BLUE)

# Stats Highlights (4 mini-cards)
stats = [
    ("Total Questions", "100 MCQs"),
    ("Maximum Marks", "200 Marks"),
    ("Total Duration", "60 Minutes"),
    ("Negative Marking", "0.50 per wrong")
]
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

# Bottom Call To Action / Branding Footer
cover_page.draw_rect(fitz.Rect(40, 745, 555, 805), color=None, fill=DARK_NAVY)
cover_page.insert_text(
    fitz.Point(60, 770),
    "Attempt this exact paper in real CBT Interface with Timer & Rank Predictor:",
    fontsize=9,
    fontname="helv",
    color=(0.8, 0.85, 0.95)
)
cover_page.insert_text(
    fitz.Point(60, 788),
    "Visit: www.ssczone.in/papers  |  Mobile App available for Android",
    fontsize=9.5,
    fontname="helv",
    color=(1, 1, 1)
)

# Insert the cover page at index 0
doc.insert_pdf(cover_doc, from_page=0, to_page=0, start_at=0)

# Set Clean Metadata
doc.set_metadata({
    "title": "SSC CGL 2025 Tier-I Official Paper (12 Sept Shift 1) - SSC ZONE",
    "author": "SSC ZONE",
    "subject": "SSC CGL 2025 Tier-1 Previous Year Paper with Official Key",
    "keywords": "SSC CGL, 2025, PYQ, SSC ZONE, Question Paper, Answer Key",
    "creator": "SSC ZONE Education Portal (www.ssczone.in)",
    "producer": "SSC ZONE PDF Engine"
})

# Save to destination
os.makedirs(output_dir, exist_ok=True)
doc.save(final_output_pdf, garbage=4, deflate=True)
doc.close()
cover_doc.close()

print(f"\nSUCCESS! Generated {final_output_pdf}")
print(f"Original size: {os.path.getsize(input_pdf):,} bytes")
print(f"Final clean size: {os.path.getsize(final_output_pdf):,} bytes")

# Copy to public/papers for web downloads
web_dir = r"c:\ssczone\public\papers"
os.makedirs(web_dir, exist_ok=True)
web_pdf = os.path.join(web_dir, "ssc-cgl-2025-12-sept-shift-1.pdf")
with open(final_output_pdf, "rb") as sf, open(web_pdf, "wb") as df:
    df.write(sf.read())
print(f"Copied for website downloads at: {web_pdf}")
