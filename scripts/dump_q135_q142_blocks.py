import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

for pno in [5, 6]:
    page = doc[pno]
    blocks = page.get_text('blocks')
    print(f"=== PAGE {pno+1} BLOCKS ===")
    for b in blocks:
        # b is (x0, y0, x1, y1, text, block_no, block_type)
        txt = b[4]
        if any(f"{qn}." in txt for qn in range(134, 143)):
            print(f"--- Block {b[5]} ---")
            print(txt)
