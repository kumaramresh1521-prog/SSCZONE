import re
import os

def decode_devanagari_null(t: str) -> str:
    t = t.replace('वा\x00ांश', 'वाक्यांश')
    t = t.replace('सं\x00ेषण', 'संश्लेषण')
    t = t.replace('श\x00\x00', 'शब्दों')
    t = t.replace('\x00ह\x00दी', 'हिंदी')
    t = t.replace('अथ\x00', 'अर्थ')
    t = t.replace('स्वाथ\x00', 'स्वार्थी')
    t = t.replace('महत्वपूण\x00', 'महत्वपूर्ण')
    t = t.replace('पूण\x00', 'पूर्ण')
    t = t.replace('तक\x00', 'तर्क')
    t = t.replace('समथ\x00न', 'समर्थन')
    t = t.replace('धम\x00', 'धर्म')
    t = t.replace('कम\x00', 'कर्म')
    t = t.replace('पूव\x00', 'पूर्व')
    t = t.replace('म\x00', 'में')
    t = t.replace('ह\x00', 'हैं')
    t = t.replace('दोन\x00', 'दोनों')
    t = t.replace('हाथ\x00', 'हाथों')
    t = t.replace('लोग\x00', 'लोगों')
    t = t.replace('दूसर\x00', 'दूसरों')

    consonants = 'कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'
    for c in consonants:
        t = t.replace(f'\x00{c}', f'{c}ि')
    t = t.replace('\x00', '')

    fixes = [
        ("तु ारे", "तुम्हारे"), ("तु ारा", "तुम्हारा"), ("तु ारी", "तुम्हारी"),
        (" पाट ", " पार्टी "), (" मला", " मिला"), (" मली", " मिली"), (" मले", " मिले"),
        (" कया", " किया"), (" कए", " किए"), (" लया", " लिया"), (" लए", " लिए"),
        ("इस लए", "इसलिए"), ("इसलए", "इसलिए"), ("चा हए", "चाहिए"), ("चाहए", "चाहिए"),
        ("प रवार", "परिवार"), ("परवार", "परिवार"), ("कु शल", "कुशल"), ("कु छ", "कुछ"),
        ("स्वाथ ", "स्वार्थी "), (" नकले", "निकले"), (" नरीक्षण", "निरीक्षण"),
        ("अ स्तत्व", "अस्तित्व"), ("अस्तत्व", "अस्तित्व"), (" न त", "निश्चित"),
        ("दूसर ", "दूसरों "), ("च ता", "चिंता"), (" बना", "बिना"),
        ("दोन ", "दोनों "), ("हाथ ", "हाथों "), ("शां त", "शांति"),
        ("व्यव ा", "व्यवस्था"), ("धम ", "धर्म "), ("पक्ष ", "पक्षों "),
        (" ारा", " द्वारा"), (" ववाद", "विवाद"), (" नयुक्त", "नियुक्त"),
        (" वश्वास", "विश्वास"), ("स हासन", "सिंहासन"), ("मु  ल", "मुश्किल"),
        ("अ धक", "अधिक"), ("अधक", "अधिक"), ("अ तरेक", "अतिरेक"),
        (" शक्षक", " शिक्षक"), ("छात्र ", "छात्रों "), (" नमंत्रण", " निमंत्रण"),
        (" ज़ ी", "ज़िद्दी"), ("मं दर", "मंदिर"), ("सं ेषण", "संश्लेषण"),
        (" नयम", "नियम"), ("कं ठस्थ", "कंठस्थ"), ("महत्वपूण ", "महत्वपूर्ण "),
        ("चूँ क", "चूँकि"), ("यहैं", "यह"), ("नह ", "नहीं "), ("नहैं", "नहीं"),
        ("मलना", "मिलना"), ("पर्यावची", "पर्यायवाची"), ("वलोम", "विलोम"),
        ("समनर्थी", "समानार्थी"), ("नष्फल", "निष्फल"), ("स्वयंसद्ध", "स्वयंसिद्ध"),
        ("परश्रमी", "परिश्रमी"), ("शपपूर्थक", "शपथपूर्वक"), ("अर्या", "अर्थ"),
    ]
    for p, r in fixes:
        t = t.replace(p, r)
    t = re.sub(r'[ ]{2,}', ' ', t).strip()
    return t

def parse_syno_anto():
    with open("scripts/scratch/syno_anto_raw.txt", "r", encoding="utf-8") as f:
        raw = f.read()

    decoded = decode_devanagari_null(raw)
    decoded = re.sub(r'--- Page \d+ ---.*?A \d+ words\n', '', decoded, flags=re.DOTALL)
    decoded = re.sub(r'ssczone\.com Page \d+', '', decoded)
    decoded = re.sub(r'ssczone\.com', '', decoded)

    lines = [l.strip() for l in decoded.splitlines() if l.strip()]

    items = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Check if line has a keyword: ALL CAPS word followed by Hindi meaning
        m_head = re.match(r'^([A-Z][A-Z\s\(\)\-\'\’]+?)\s+([\u0900-\u097F].*)$', line)
        if m_head:
            keyword = m_head.group(1).strip()
            hi_meaning = m_head.group(2).strip()
            syn_words = []
            ant_words = []

            # Check next lines for Syn and Ant
            j = i + 1
            while j < len(lines):
                nline = lines[j]
                if nline.startswith("Syn"):
                    syn_text = re.sub(r'^Syn\s*', '', nline).strip()
                    syn_words = [w.strip() for w in syn_text.split(',') if w.strip()]
                    j += 1
                elif nline.startswith("Ant"):
                    ant_text = re.sub(r'^Ant\s*', '', nline).strip()
                    ant_words = [w.strip() for w in ant_text.split(',') if w.strip()]
                    j += 1
                else:
                    break

            items.append({
                "keyword": keyword,
                "hi_meaning": hi_meaning,
                "synonyms": syn_words,
                "antonyms": ant_words
            })
            i = j
        else:
            i += 1

    return items

def generate_html(items):
    cards = []
    for idx, it in enumerate(items, 1):
        kw = it["keyword"]
        hi_m = it["hi_meaning"]
        syns = it["synonyms"]
        ants = it["antonyms"]

        syn_pills = "".join(f'<span class="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-md">{s}</span>' for s in syns)
        ant_pills = "".join(f'<span class="px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 rounded-md">{a}</span>' for a in ants)

        cards.append(f"""
    <!-- Keyword Card -->
    <div id="word-{idx}" class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 rounded-md">#{idx}</span>
            <h3 class="text-base sm:text-lg font-black text-indigo-900 tracking-tight">{kw}</h3>
          </div>
          <span class="text-xs font-bold text-slate-500 uppercase">TCS Master Word</span>
        </div>

        <div class="mb-3 p-2 bg-slate-50 border border-slate-200/70 rounded-xl">
          <span class="text-xs font-bold text-slate-600">हिंदी अर्थ:</span>
          <span class="text-sm font-bold text-slate-900 ml-1">{hi_m}</span>
        </div>

        <!-- Synonyms -->
        <div class="mb-2.5">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-1">
            ✓ Synonyms (समानार्थी शब्द):
          </span>
          <div class="flex flex-wrap gap-1.5">
            {syn_pills}
          </div>
        </div>

        <!-- Antonyms -->
        <div>
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-rose-800 block mb-1">
            ✕ Antonyms (विलोम शब्द):
          </span>
          <div class="flex flex-wrap gap-1.5">
            {ant_pills}
          </div>
        </div>
      </div>
    </div>
""")

    body_cards = "\n".join(cards)

    full_html = f"""<div class="space-y-8">
  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50/90 to-blue-50/90 p-6 md:p-8 rounded-2xl border border-indigo-200/70 shadow-xs">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-xs">
        Chapter 12 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-800 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-200/60">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
      Synonyms &amp; Antonyms (पर्यायवाची एवं विलोम शब्द) &bull; 498 Master Keywords
    </h1>
    <p class="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl mb-4">
      SSC परीक्षाओं में <strong>Synonyms एवं Antonyms</strong> से Tier-1 तथा Tier-2 में 6 से 8 प्रश्न सीधे पूछे जाते हैं। 
      नीचे परीक्षा के सभी 498 सर्वाधिक महत्वपूर्ण Keywords के साथ उनका सटीक हिंदी अर्थ, समानार्थक शब्द (Synonyms) तथा विलोम शब्द (Antonyms) अलग-अलग उच्च-स्पष्टता वाले बैज में दिए गए हैं।
    </p>

    <!-- Metrics Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-indigo-200/60 text-center">
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-indigo-700">{len(items)}</span>
        <span class="text-xs font-semibold text-slate-600">Keywords</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-blue-700">4,000+</span>
        <span class="text-xs font-semibold text-slate-600">Total Thesaurus</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-emerald-700">Categorized</span>
        <span class="text-xs font-semibold text-slate-600">Syns vs Ants</span>
      </div>
      <div class="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
        <span class="block text-2xl font-black text-amber-700">6-8 Questions</span>
        <span class="text-xs font-semibold text-slate-600">Exam Weightage</span>
      </div>
    </div>
  </div>

  <!-- Words Grid -->
  <div class="space-y-4">
    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
      <h2 class="text-xl font-bold text-slate-900">498 Keywords Master Compendium</h2>
      <span class="text-xs font-semibold text-slate-500">{len(items)} Complete Entries</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{body_cards}
    </div>
  </div>
</div>"""
    return full_html

if __name__ == '__main__':
    items = parse_syno_anto()
    html = generate_html(items)
    out_path = "scripts/scratch/syno_anto_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Successfully rebuilt {out_path} with {len(items)} keywords. (Length: {len(html)})")
