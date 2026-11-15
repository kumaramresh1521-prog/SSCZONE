import os
import pypdf

folder = r"F:\ssc\eng notes"
out_dir = r"scripts/scratch"
os.makedirs(out_dir, exist_ok=True)

files = [
    "noun_ssczone.pdf",
    "adjective_ssczone.pdf",
    "adverb_ssczone.pdf",
    "articles_ssczone.pdf",
    "voice_notes_ssczone_clean.pdf"
]

for name in files:
    path = os.path.join(folder, name)
    reader = pypdf.PdfReader(path)
    text = "\n".join([p.extract_text() or "" for p in reader.pages])
    base = name.replace(".pdf", "")
    out_path = os.path.join(out_dir, f"{base}_raw.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"{name}: {len(text)} chars -> {out_path}")
