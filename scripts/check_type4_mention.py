import glob

# Search in scripts/ for any mention of "Type-IV" or "Type 4" or "Type-4"
found = []
for f in glob.glob('scripts/**/*.py', recursive=True):
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            c = fp.read()
            if 'type4' in c.lower() or 'type-iv' in c.lower() or 'type 4' in c.lower() or 'type iv' in c.lower():
                found.append(f)
    except:
        pass

print("Mentions of Type 4/IV:", found)
