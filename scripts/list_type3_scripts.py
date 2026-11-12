import glob

files = glob.glob('scripts/*type3*.py')
print("Type 3 scripts:")
for f in files:
    print(" -", f)
