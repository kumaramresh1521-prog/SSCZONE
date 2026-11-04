import fitz

doc = fitz.open()
page = doc.new_page(width=595, height=842)

PRIMARY = (30/255, 41/255, 59/255) # #1E293B
ACCENT = (37/255, 99/255, 235/255) # #2563EB
LIGHT_BG = (248/255, 250/255, 252/255) # #F8FAFC
BORDER = (226/255, 232/255, 240/255)

# Background
page.draw_rect(fitz.Rect(0, 0, 595, 842), color=None, fill=LIGHT_BG)

# Top Banner
page.draw_rect(fitz.Rect(0, 0, 595, 140), color=None, fill=PRIMARY)

# Decorative accent bar
page.draw_rect(fitz.Rect(0, 140, 595, 146), color=None, fill=ACCENT)

# Title in banner
page.insert_text(fitz.Point(40, 55), "SSC ZONE", fontsize=28, color=(1, 1, 1), fontname="helv")
page.insert_text(fitz.Point(40, 85), "PREVIOUS YEAR QUESTION PAPER SERIES", fontsize=11, color=(0.7, 0.8, 1), fontname="helv")
page.insert_text(fitz.Point(40, 115), "Official Exam Paper with Answer Key", fontsize=10, color=(0.85, 0.85, 0.9), fontname="helv")

doc.save("tmp/test_cover.pdf")
print("Saved tmp/test_cover.pdf successfully!")
