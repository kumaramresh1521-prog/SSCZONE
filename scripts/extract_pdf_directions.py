import pdfplumber

pdf_path = r"C:\Users\Admin\.gemini\antigravity\brain\a4f88990-1ffd-4462-a906-52e3447e1c0c\.user_uploaded\media_1794756445934_6ed122bd.pdf"

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i in range(len(pdf.pages)):
        text = pdf.pages[i].extract_text()
        print(f"\n================ PAGE {i+1} ================")
        if text:
            # Print first 600 characters of each page
            lines = text.split("\n")
            for line in lines[:25]:
                print(line)
        else:
            print("[EMPTY / SCANNED]")
