# -*- coding: utf-8 -*-
"""
Generate comprehensive, clean, bilingual HTML for Idioms & Phrases.
Parses all 450+ idioms from PDF raw text, cleans Hindi OCR ligatures,
adds thematic cluster cards, and formats everything to SSCZone standard components.
"""

import re
import os

hindi_clean_map = {
    " ेज़ल": "फ्रेजल", " ह दी म  ": "हिंदी में", " ह दी": "हिंदी", "म  ": "में ", "म ": "में ",
    " जके ": "जिसके ", " जसे ": "जिससे ", " जने ": "जिसने ", " जका ": "जिसका ", " जस ": "जिस ",
    "अथ ": "अर्थ", "ह  ": "हैं ", "ह ": "हैं ", "कु शल": "कुशल", "तु ारे": "तुम्हारे",
    "तु ारा": "तुम्हारा", "तु ारी": "तुम्हारी", " म  ": " में ", " मला": " मिला", " मली": " मिली",
    " मले": " मिले", " कया": " किया", " कए": " किए", " क": " कि", "क ": "की ", "आदत ": "आदतों ",
    "पुर ार": "पुरस्कार", "प्र तयो गता": "प्रतियोगिता", "सम ा": "समस्या", "संबं धत": "संबंधित",
    "तक  ": "तर्क ", "समथ न": "समर्थन", " व ास": "विश्वास", "कया": "किया", "प रवार": "परिवार",
    "व्यव स्थत": "व्यवस्थित", "नज़दीक ": "नज़दीकी", "स्वाथ  ": "स्वार्थी", " नकले": "निकले",
    " नरीक्षण": "निरीक्षण", "पूव ": "पूर्व", "संध्या": "संध्या", "ज़हर": "ज़हर", "अ स्तत्व": "अस्तित्व",
    " न  त": "निश्चित", " दूसर ": "दूसरों ", " च ता": "चिंता", " बना": "बिना", " लए": "लिए",
    " दोन ": "दोनों ", " हाथ ": "हाथों ", " शां त": "शांति", " व्यव ा": "व्यवस्था", " धम ": "धर्म",
    " पक्ष ": "पक्षों ", "  ारा": " द्वारा", " ववाद": "विवाद", " नयुक्त": "नियुक्त", " वश्वास": "विश्वास",
    " कज़ ": "कर्ज़", " असमथ ": "असमर्थ", " धा म क": "धार्मिक", " मामल ": "मामलों ", " अ त": "अति",
    "उ ाही": "उत्साही", "नह ": "नहीं", "नह  ": "नहीं ", "वा ांश": "वाक्यांश", "श  ": "शब्दों ",
    "प रवार": "परिवार", "इकलौता": "इकलौता", "कसी": "किसी", "कं ठस्थ": "कंठस्थ", "चा हए": "चाहिए"
}

def clean_text(t):
    t = t.replace('\x00', '').replace('ʼ', "'").replace('’', "'")
    for k, v in hindi_clean_map.items():
        t = t.replace(k, v)
    return t

def parse_idioms():
    raw_path = "scripts/scratch/idioms_raw.txt"
    with open(raw_path, "r", encoding="utf-8") as f:
        text = f.read()

    text = clean_text(text)
    entries = re.split(r'\n(?=\d+\s+[A-Z])', text)
    
    parsed = []
    for e in entries[1:]:
        lines = [l.strip() for l in e.splitlines() if l.strip() and not 'ssczone' in l and not 'Page' in l]
        if not lines:
            continue
        first_line = lines[0]
        # Match number
        m = re.match(r'^(\d+)\s+(.*)$', first_line)
        if m:
            num = m.group(1).strip()
            rest_first = m.group(2).strip()
            all_text = " ".join([rest_first] + lines[1:])
            parsed.append((num, all_text))

    print(f"Parsed {len(parsed)} idioms.")
    return parsed

def generate_idioms_chapter():
    idioms = parse_idioms()
    
    rows = []
    for num, text in idioms:
        rows.append(f"""
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-2.5 font-mono text-xs font-bold text-slate-400 w-12">{num}</td>
            <td class="p-2.5 text-slate-700 dark:text-slate-300 text-xs md:text-sm">{text}</td>
          </tr>
""")
    table_rows = "".join(rows)

    full_html = f"""
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 11 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Idioms &amp; Phrases (मुहावरे और वाक्यांश) &bull; 450+ A-to-Z Master Compendium with Meanings &amp; Examples
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      Idiom (मुहावरा) शब्दों का ऐसा समूह है जिसका लाक्षणिक अर्थ उसके शाब्दिक अर्थ से भिन्न होता है। 
      SSC CGL Tier-1 और Tier-2 में 
      <strong>Idioms &amp; Phrases से 4 से 6 प्रश्न सीधे पूछे जाते हैं</strong>। 
      यहाँ SSC परीक्षाओं में पिछले 15 वर्षों में बार-बार पूछे गए सभी 450+ मुहावरों का हिंदी अर्थ एवं प्रामाणिक उदाहरण सहित संकलन है।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">450+ Idioms</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">A to Z संपूर्ण संकलन</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">Hindi Meaning</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">सरल हिंदी अर्थ + व्याख्या</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">Exam Examples</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">वास्तविक SSC वाक्य प्रयोग</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">Tier-1 &amp; Tier-2</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">प्रत्येक शिफ्ट में 2-3 प्रश्न</span>
      </div>
    </div>
  </div>

  <!-- High-Yield Thematic Clusters -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        SSC के 4 सबसे लोकप्रिय Thematic Clusters (थीम आधारित मुहावरे)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        थीम के आधार पर याद रखने से मुहावरे कभी नहीं भूलते:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase block mb-2">1. Color-Based Idioms (रंगों पर आधारित)</span>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Once in a blue moon:</strong> कभी-कभार / बहुत दुर्लभ (Rarely)।</li>
          <li>&bull; <strong>Out of the blue:</strong> अचानक और अप्रत्याशित (Unexpectedly)।</li>
          <li>&bull; <strong>Red handed:</strong> रंगे हाथों पकड़ा जाना (In the act of crime)।</li>
          <li>&bull; <strong>Black sheep:</strong> कुल-कलंक / बदनाम व्यक्ति (Disreputable person)।</li>
        </ul>
      </div>

      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase block mb-2">2. Animal-Based Idioms (पशु-पक्षियों पर आधारित)</span>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Dark horse:</strong> अप्रत्याशित विजेता (An unexpected winner)।</li>
          <li>&bull; <strong>Cock and bull story:</strong> मनगढ़ंत बेतुकी कहानी (An absurd tale)।</li>
          <li>&bull; <strong>Crocodile tears:</strong> दिखावटी आँसू (False display of grief)।</li>
          <li>&bull; <strong>Smell a rat:</strong> दाल में कुछ काला लगना (To suspect foul play)।</li>
        </ul>
      </div>

      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-2">3. Body Parts Idioms (शरीर के अंगों पर आधारित)</span>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>At one's wit's end:</strong> हैरान / उलझन में (Completely perplexed)।</li>
          <li>&bull; <strong>At one's fingertips:</strong> पूरी जानकारी होना (Complete knowledge)।</li>
          <li>&bull; <strong>Turn a deaf ear:</strong> अनसुना करना (Refuse to listen)।</li>
          <li>&bull; <strong>Bite the bullet:</strong> अप्रिय स्थिति का साहसपूर्वक सामना करना।</li>
        </ul>
      </div>

      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase block mb-2">4. Conflict &amp; Relationship Idioms (संबंध व झगड़ा)</span>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Bone of contention:</strong> झगड़े की जड़ (Cause of dispute)।</li>
          <li>&bull; <strong>Apple of discord:</strong> विवाद का विषय (Cause of quarrel)।</li>
          <li>&bull; <strong>Bury the hatchet:</strong> दुश्मनी समाप्त करना (End the hostility)।</li>
          <li>&bull; <strong>At daggers drawn:</strong> खुली दुश्मनी (In bitter hostility)।</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Master Table of 450+ Idioms -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Master Idioms &amp; Phrases Catalog (A to Z)</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">प्रत्येक मुहावरे का अर्थ, हिंदी अनुवाद तथा प्रामाणिक उदाहरण:</p>
      </div>
      <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900">
        450+ Entries
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
            <th class="p-2.5 font-bold w-12">#</th>
            <th class="p-2.5 font-bold">Idiom, English Meaning, Hindi &amp; Sentence Example</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
{table_rows}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Solved SSC Exam PYQs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">3</span>
        SSC Previous Year Questions (PYQs with Explanations)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC CGL, CHSL एवं CPO में पूछे गए वास्तविक मुहावरे:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">High-Yield</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> Select the most appropriate meaning of the idiom: <strong>At one's wit's end</strong>
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) Highly intelligent</p>
          <p>(B) Completely perplexed</p>
          <p>(C) At the final stage</p>
          <p>(D) Very happy</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-indigo-500">
          <span class="font-bold text-indigo-700 dark:text-indigo-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'At one's wit's end' का अर्थ होता है <em>हैरान / उलझन में पड़ जाना (Completely perplexed / confused)</em>।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">High-Yield</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> To bury the hatchet means:
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) To dig the ground</p>
          <p>(B) To make peace and end conflict</p>
          <p>(C) To hide a weapon</p>
          <p>(D) To start a quarrel</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-emerald-500">
          <span class="font-bold text-emerald-700 dark:text-emerald-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'Bury the hatchet' का अर्थ होता है <em>पुरानी दुश्मनी भुलाकर समझौता करना (To end hostilities and make peace)</em>।
        </div>
      </div>
    </div>
  </div>

  <!-- FAQs -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (Idioms FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. क्या SSC में मुहावरों के विकल्प बहुत भ्रमित करने वाले होते हैं?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          हाँ! SSC प्रायः मुहावरे के शाब्दिक शब्दों (Literal words) से मिलते-जुलते भ्रामक विकल्प बनाता है। याद रखें कि मुहावरे का अर्थ कभी भी शाब्दिक (Literal) नहीं होता, सदा लाक्षणिक (Metaphorical) होता है।
        </p>
      </details>
    </div>
  </div>

</div>
"""

    out_path = "scripts/scratch/idioms_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated {out_path} with {len(full_html)} chars.")

if __name__ == "__main__":
    generate_idioms_chapter()
