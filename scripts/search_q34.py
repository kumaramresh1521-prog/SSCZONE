import glob
import os

# Search for "4 : 32" or "4:32" in any raw files
matches = []
for p in glob.glob('**/*', recursive=True):
    if os.path.isfile(p) and any(ext in p for ext in ['.txt', '.json', '.md']) and 'node_modules' not in p and '.git' not in p and '.next' not in p:
        try:
            with open(p, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if '4 : 32' in content or '4:32' in content:
                    matches.append(p)
        except:
            pass

print("Files containing '4 : 32' or '4:32':")
for m in matches[:15]:
    print(" -", m)
