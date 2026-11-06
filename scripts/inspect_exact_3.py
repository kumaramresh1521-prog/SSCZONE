import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. 8 Oct Shift 2 Q.6
doc1 = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 2).pdf")
print("=== 8 OCT S2 - Q.6 ===")
for b in doc1[1].get_text("blocks"):
    if any(t in b[4] for t in ["Who is sitting", "(A)", "Ans:"]):
        print(repr(b[4]))

# 2. 10 Oct Shift 2 Q.7
doc2 = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf")
print("\n=== 10 OCT S2 - Q.7 ===")
for b in doc2[1].get_text("blocks"):
    if any(t in b[4] for t in ["unit digit", "(A)", "Ans:"]):
        print(repr(b[4]))

# 3. 10 Oct Shift 3 Q.13
doc3 = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf")
print("\n=== 10 OCT S3 - Q.13 ===")
for b in doc3[2].get_text("blocks"):
    if any(t in b[4] for t in ["13.", "(A)", "Ans:"]):
        print(repr(b[4]))
