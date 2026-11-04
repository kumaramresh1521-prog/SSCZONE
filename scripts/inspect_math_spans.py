import fitz
import sys
sys.stdout.reconfigure(encoding='utf-8')

def inspect_page_spans(pdf_path, pno):
    doc = fitz.open(pdf_path)
    p = doc[pno]
    dict_data = p.get_text("dict")
    print(f"=== Spans on Page {pno} of {pdf_path} ===")
    for block in dict_data.get("blocks", []):
        if "lines" in block:
            for line in block["lines"]:
                for span in line.get("spans", []):
                    txt = span.get("text", "").strip()
                    if txt:
                        font = span.get("font", "")
                        bbox = [round(x, 1) for x in span.get("bbox", [])]
                        print(f"[{bbox}] font={font} | text={repr(txt)}")

if __name__ == "__main__":
    pno = int(sys.argv[2])
    inspect_page_spans(sys.argv[1], pno)
