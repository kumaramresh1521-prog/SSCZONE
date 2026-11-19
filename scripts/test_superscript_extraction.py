import fitz
import re

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

def extract_page_with_superscripts(page):
    d = page.get_text('dict')
    lines_out = []
    for b in d['blocks']:
        if 'lines' not in b:
            continue
        for l in b['lines']:
            spans = l['spans']
            if not spans:
                continue
            base_size = max(s['size'] for s in spans)
            line_str = ''
            for s in spans:
                txt = s['text']
                font = s['font']
                # Check for SymbolMT pi
                if 'Symbol' in font and txt == 'p':
                    txt = 'π'
                elif 'Wingdings' in font:
                    txt = ''
                # Check if superscript
                if s['size'] < base_size - 1.5 and txt.strip() and not txt.strip().startswith('(') and not txt.strip().endswith(')'):
                    # convert digits to superscripts or ^{...}
                    line_str += f"^{{{txt.strip()}}}"
                else:
                    line_str += txt
            lines_out.append(line_str)
    return '\n'.join(lines_out)

# Let's test on page 8 (which has Q160-Q174)
print("=== PAGE 8 TEST ===")
print(extract_page_with_superscripts(doc[7])[:1500])
