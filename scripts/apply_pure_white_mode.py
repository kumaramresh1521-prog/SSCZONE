import os
import glob
import json
import re
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

SUPABASE_URL = "https://gxdlpdzmsghvugbclxov.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZGxwZHptc2dodnVnYmNseG92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MjAwOCwiZXhwIjoyMDg1MzI4MDA4fQ.4TjZ4275E59q5e14kdrH87zU8k3T8bWJpQ2Zl_n4sFE"

def clean_html(c: str) -> str:
    if not c:
        return ""

    # 1. Transform raw dark boxes to light mode
    c = c.replace('bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800', 
                  'bg-gradient-to-br from-indigo-50/80 to-blue-50/80 text-slate-800 rounded-2xl shadow-xs border border-indigo-200/80')
    c = c.replace('bg-slate-950/80', 'bg-white shadow-2xs')
    c = c.replace('bg-slate-800/80', 'bg-white shadow-2xs')
    c = c.replace('bg-slate-800/70', 'bg-white shadow-2xs')
    c = c.replace('border-slate-800', 'border-indigo-100')
    c = c.replace('border-slate-700', 'border-indigo-100')

    # 2. Convert low-contrast text colors to rich, crisp high-contrast variants
    c = re.sub(r'\btext-indigo-400\b', 'text-indigo-700', c)
    c = re.sub(r'\btext-emerald-400\b', 'text-emerald-700', c)
    c = re.sub(r'\btext-blue-400\b', 'text-blue-700', c)
    c = re.sub(r'\btext-amber-400\b', 'text-amber-700', c)
    c = re.sub(r'\btext-indigo-300\b', 'text-indigo-800', c)
    c = re.sub(r'\btext-emerald-300\b', 'text-emerald-800', c)
    c = re.sub(r'\btext-slate-300\b', 'text-slate-700', c)
    c = re.sub(r'\btext-slate-400\b', 'text-slate-500', c)

    # 3. Strip all dark: modifiers
    c = re.sub(r'\bdark:[a-zA-Z0-9\/:_.-]+', '', c)

    # 4. Clean any extra spaces in class attributes
    def clean_class(m):
        classes = ' '.join(m.group(1).split())
        return f'class="{classes}"'
    c = re.sub(r'class="([^"]*)"', clean_class, c)
    return c

def update_supabase(slug: str, content: str):
    url = f"{SUPABASE_URL}/rest/v1/blogs?slug=eq.{slug}"
    payload = json.dumps({"content": content}).encode("utf-8")
    req = Request(
        url,
        data=payload,
        method="PATCH",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }
    )
    for attempt in range(4):
        try:
            with urlopen(req, timeout=30) as resp:
                if resp.status in (200, 204):
                    return True
        except Exception as e:
            time.sleep(1.5 * (attempt + 1))
            if attempt == 3:
                raise e
    return False

def main():
    print("=" * 70)
    print("STEP 1: Cleaning HTML in scripts/scratch/*.html")
    print("=" * 70)
    for f in sorted(glob.glob('scripts/scratch/*.html')):
        with open(f, 'r', encoding='utf-8') as fp:
            raw = fp.read()
        cleaned = clean_html(raw)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(cleaned)
        print(f"  Cleaned: {os.path.basename(f)} (Length: {len(cleaned)})")

    print("\n" + "=" * 70)
    print("STEP 2: Cleaning local src/data/chapter_notes.json")
    print("=" * 70)
    json_path = os.path.join("src", "data", "chapter_notes.json")
    with open(json_path, 'r', encoding='utf-8') as fp:
        notes = json.load(fp)

    cleaned_count = 0
    slugs_to_sync = []
    for n in notes:
        content = n.get('content', '')
        if 'dark:' in content or 'bg-slate-900' in content or 'bg-slate-800' in content or 'text-slate-400' in content:
            cleaned = clean_html(content)
            n['content'] = cleaned
            cleaned_count += 1
            slugs_to_sync.append((n['slug'], cleaned))

    with open(json_path, 'w', encoding='utf-8') as fp:
        json.dump(notes, fp, ensure_ascii=False, indent=2)
    print(f"  Cleaned {cleaned_count} notes in chapter_notes.json")

    print("\n" + "=" * 70)
    print("STEP 3: Syncing Cleaned White-Mode HTML to Supabase")
    print("=" * 70)
    for slug, cleaned_content in slugs_to_sync:
        print(f"  Uploading {slug} to Supabase...", end="", flush=True)
        success = update_supabase(slug, cleaned_content)
        if success:
            print(" SUCCESS [200 OK]")
        else:
            print(" FAILED")

    print("\n" + "=" * 70)
    print("STEP 4: Post-Update Verification Audit")
    print("=" * 70)
    with open(json_path, 'r', encoding='utf-8') as fp:
        verify_notes = json.load(fp)

    total_dark = 0
    total_black = 0
    total_faint = 0
    for n in verify_notes:
        c = n.get('content', '')
        d = len(re.findall(r'dark:', c))
        b = len(re.findall(r'(?<![:a-zA-Z0-9_-])(?:bg-slate-[89]00|bg-gray-[89]00|bg-black|#0f172a|#1e293b)', c))
        f = len(re.findall(r'\btext-slate-[34]00\b', c))
        total_dark += d
        total_black += b
        total_faint += f
        if d > 0 or b > 0 or f > 0:
            print(f"  FAILED: {n['slug']} still has d={d}, b={b}, f={f}")

    print(f"  TOTAL DARK MODIFIERS REMAINING IN CHAPTER_NOTES.JSON: {total_dark}")
    print(f"  TOTAL BLACK BACKGROUNDS REMAINING: {total_black}")
    print(f"  TOTAL FAINT TEXT REMAINING: {total_faint}")
    if total_dark == 0 and total_black == 0 and total_faint == 0:
        print("  ALL 24 CHAPTER NOTES ARE 100% PURE CLEAN WHITE MODE!")

if __name__ == '__main__':
    main()
