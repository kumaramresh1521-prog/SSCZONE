import os, glob

matches = glob.glob('c:/ssczone/**/ssc-cgl-2026-8-october-2026-shift-1*', recursive=True)
for m in matches[:10]:
    print(m)
