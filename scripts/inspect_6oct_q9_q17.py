import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf")
for pno in range(len(doc)):
    page = doc[pno]
    text = page.get_text()
    if "9. Complete the pattern in fig" in text:
        print(f"--- Q.9 Page {pno+1} ---")
        idx = text.find("9. Complete")
        print(repr(text[idx:idx+250]))
        # Check images on this page
        for img in page.get_images(full=True):
            print("  Image:", img[0], page.get_image_bbox(img))
    if "17. Carefully observe" in text:
        print(f"--- Q.17 Page {pno+1} ---")
        idx = text.find("17. Carefully")
        print(repr(text[idx:idx+250]))
        for img in page.get_images(full=True):
            print("  Image:", img[0], page.get_image_bbox(img))
