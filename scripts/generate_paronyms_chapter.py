# -*- coding: utf-8 -*-
"""
Generate comprehensive, clean, bilingual HTML for Paronyms & Homonyms.
Parses all 227 confusing word sets (490 words) from PDF raw text,
cleans Hindi OCR ligatures, adds key comparison highlights, and formats to SSCZone standard.
"""

import re
import os

hindi_clean_map = {
    "पैरोनम्स": "पैरोनिम्स", "होमोनम्स": "होमोनिम्स", "हदी": "हिंदी", "म ": "में ", "म  ": "में ",
    "ह ": "हैं ", "ह  ": "हैं ", "जनका": "जिनका", "अथ": "अर्थ", "उत्पत्त": "उत्पत्ति",
    "मलती": "मिलती", "मलता": "मिलता", "बोडग": "बोर्डिंग", "अनुमत": "अनुमति", "कारगल": "कारगिल",
    "क पहाड़य": "की पहाड़ियों", "कठन": "कठिन", "अत्यधक": "अत्यधिक", "कवता": "कविता", "संके त": "संकेत",
    "संदभ": "संदर्भ", "कु छ": "कुछ", "मु  ल": "मुश्किल", "स हासन": "सिंहासन", "शक्षक ": "शिक्षकों ",
    "शक्षक": "शिक्षक", "नमंत्रण": "निमंत्रण", "छोड़कर": "छोड़कर", "ज़ ी": "ज़िद्दी", "वचार": "विचार",
    "मं दर": "मंदिर", "अ धक": "अधिक", "कज़ ": "कर्ज़", "समथ न": "समर्थन", "वश्वास": "विश्वास"
}

def clean_text(t):
    t = t.replace('\x00', '').replace('ʼ', "'").replace('’', "'").replace('', '(').replace('', ')')
    for k, v in hindi_clean_map.items():
        t = t.replace(k, v)
    return t

def parse_paronyms():
    raw_path = "scripts/scratch/paronyms_raw.txt"
    with open(raw_path, "r", encoding="utf-8") as f:
        text = f.read()

    text = clean_text(text)
    # Match entries
    matches = re.findall(r'\n(\d+)\s+([A-Z][a-zA-Z\s\(\)\-\'\’]+?)\s+([a-z].*?)(?=\n\d+\s+[A-Z]|\Z)', text, re.DOTALL)
    
    # Group by set number
    grouped = {}
    for num, word, desc in matches:
        desc_clean = " ".join(desc.split())
        grouped.setdefault(num.strip(), []).append((word.strip(), desc_clean))

    print(f"Grouped into {len(grouped)} sets.")
    return grouped

def generate_paronyms_chapter():
    grouped = parse_paronyms()
    
    set_blocks = []
    # Sort by integer set number
    sorted_keys = sorted(grouped.keys(), key=lambda x: int(x) if x.isdigit() else 999)
    
    for num in sorted_keys:
        words = grouped[num]
        word_items = []
        for word, desc in words:
            word_items.append(f"""
            <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs">
              <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm block mb-1">{word}</span>
              <p class="text-slate-700 dark:text-slate-300 leading-relaxed">{desc}</p>
            </div>
""")
        words_html = "".join(word_items)
        
        block = f"""
        <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700">
            <span class="text-xs font-mono font-bold text-slate-400">Set #{num}</span>
            <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{" / ".join(w[0] for w in words)}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-{min(len(words), 3)} gap-2.5">
            {words_html}
          </div>
        </div>
"""
        set_blocks.append(block)

    all_sets_html = "".join(set_blocks)

    full_html = f"""
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 13 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Paronyms &amp; Homonyms (समोच्चरित एवं भ्रामक शब्द) &bull; Complete 227 Sets &amp; 490+ Confusing Words
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      <strong>Paronyms</strong> वे शब्द हैं जिनका अर्थ भिन्न होता है लेकिन रूप या व्युत्पत्ति (Derivation) समान होती है (जैसे <em>Affect / Effect</em>)। 
      <strong>Homonyms / Homophones</strong> वे शब्द हैं जिनका उच्चारण (Sound) समान होता है लेकिन वर्तनी (Spelling) और अर्थ भिन्न होते हैं (जैसे <em>Accept / Except</em>)। 
      SSC परीक्षाओं में <strong>Fill in the Blanks, Cloze Test और Error Detection</strong> में इन शब्दों से सर्वाधिक प्रश्न पूछे जाते हैं।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">227 Sets</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">490+ भ्रामक शब्द</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">Pairs &amp; Triplets</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">सटीक तुलनात्मक अध्ययन</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">Hindi Meaning</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">शुद्ध हिंदी अर्थ + वाक्य प्रयोग</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">Exam Weightage</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Cloze Test &bull; Blanks 3-4 Qs</span>
      </div>
    </div>
  </div>

  <!-- Section 1: Top 5 Deadly SSC Confusion Pairs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        SSC के 5 सर्वाधिक घातक भ्रमकारी शब्द (Top 5 Deadly Pairs)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        परीक्षा में छात्र सबसे ज्यादा गलतियाँ इन्हीं युग्मों में करते हैं:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <!-- Pair 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-rose-600 dark:text-rose-400 text-sm block mb-1">1. Affect (Verb) vs. Effect (Noun)</span>
        <ul class="space-y-1 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Affect (क्रिया &mdash; प्रभावित करना):</strong> <em>Smoking severely affects your lungs.</em></li>
          <li>&bull; <strong>Effect (संज्ञा &mdash; प्रभाव / परिणाम):</strong> <em>The effect of the medicine was miraculous.</em></li>
          <li><span class="text-slate-500">(विशेष: Effect क्रिया के रूप में 'लागू करना' अर्थ में भी आ सकता है &mdash; effect changes)</span></li>
        </ul>
      </div>

      <!-- Pair 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-blue-600 dark:text-blue-400 text-sm block mb-1">2. Compliment vs. Complement</span>
        <ul class="space-y-1 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Compliment (प्रशंसा / तारीफ करना):</strong> <em>He paid her a nice compliment on her dress.</em></li>
          <li>&bull; <strong>Complement (पूरक होना / पूर्ण करना):</strong> <em>Rice and curry complement each other perfectly.</em></li>
        </ul>
      </div>

      <!-- Pair 3 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-emerald-600 dark:text-emerald-400 text-sm block mb-1">3. Stationary vs. Stationery</span>
        <ul class="space-y-1 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Stationary (स्थिर / अचल &mdash; with 'a'):</strong> <em>The car collided with a stationary truck.</em></li>
          <li>&bull; <strong>Stationery (लेखन सामग्री &mdash; with 'e'):</strong> <em>I bought pens and notebooks from the stationery shop.</em></li>
        </ul>
      </div>

      <!-- Pair 4 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="font-bold text-amber-600 dark:text-amber-400 text-sm block mb-1">4. Principle vs. Principal</span>
        <ul class="space-y-1 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Principle (सिद्धांत / नियम &mdash; Rule):</strong> <em>He is a man of strict principles.</em></li>
          <li>&bull; <strong>Principal (प्राचार्य / मुख्य &mdash; Head / Main):</strong> <em>The Principal gave an inspiring speech.</em></li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Master 227 Sets Catalog -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Master Paronyms &amp; Homonyms Catalog (227 Sets)</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">प्रत्येक सेट में तुलनात्मक शब्द, अंग्रेजी भाव, हिंदी अनुवाद तथा उदाहरण:</p>
      </div>
      <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900">
        227 Sets &bull; 490+ Words
      </span>
    </div>

    <div class="space-y-3">
{all_sets_html}
    </div>
  </div>

  <!-- Solved SSC Exam PYQs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">2</span>
        SSC Previous Year Questions (PYQs with Explanations)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC CGL, CHSL एवं CPO में पूछे गए वास्तविक प्रश्न:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">Affect / Effect</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> The heavy rainfall will __________ the crop production this year.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) effect</p>
          <p>(B) affect</p>
          <p>(C) effective</p>
          <p>(D) affection</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-rose-500">
          <span class="font-bold text-rose-700 dark:text-rose-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> वाक्य में 'will' सहायक क्रिया के बाद Main Verb की आवश्यकता है। 'Affect' क्रिया (Verb) है जिसका अर्थ है प्रभावित करना।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">Stationary</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> The truck hit a __________ vehicle parked by the roadside.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) stationery</p>
          <p>(B) stationary</p>
          <p>(C) stationer</p>
          <p>(D) stations</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-indigo-500">
          <span class="font-bold text-indigo-700 dark:text-indigo-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'खड़ा या स्थिर वाहन' के लिए <strong>Stationary</strong> (with 'a') सही शब्द है। Stationery (with 'e') का अर्थ कॉपी-किताब होता है।
        </div>
      </div>
    </div>
  </div>

  <!-- FAQs -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (Paronyms FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. Paronyms और Homonyms में क्या अंतर है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Homonyms (समोच्चरित शब्द):</strong> जिनका उच्चारण (sound) एक जैसा होता है (जैसे <em>Altar / Alter</em>, <em>Brake / Break</em>)।<br>
          <strong>Paronyms:</strong> जिनका रूप या मूल व्युत्पत्ति मिलती-जुलती होती है लेकिन अर्थ अलग होता है (जैसे <em>Childish / Childlike</em>, <em>Artful / Artistic</em>)।
        </p>
      </details>
    </div>
  </div>

</div>
"""

    out_path = "scripts/scratch/paronyms_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated {out_path} with {len(full_html)} chars.")

if __name__ == "__main__":
    generate_paronyms_chapter()
