# -*- coding: utf-8 -*-
"""
Generate comprehensive, clean, bilingual HTML for Phrasal Verbs.
Parses all 215 phrasal verbs from PDF raw text, cleans Hindi OCR ligatures,
and produces the master chapter matching the SSCZone UI design system.
"""

import re
import os

hindi_clean_map = {
    " ेज़ल": "फ्रेजल", " े ज़ल": "फ्रेजल", "वब ": "वर्ब", "व  ": "वर्ब", " ह दी म  ": "हिंदी में",
    " ह दी": "हिंदी", "म  ": "में ", "म ": "में ", " जके ": "जिसके ", " जसे ": "जिससे ",
    " जने ": "जिसने ", " जका ": "जिसका ", " जस ": "जिस ", "अथ ": "अर्थ", "ह  ": "हैं ",
    "ह ": "हैं ", "कु शल": "कुशल", "तु ारे": "तुम्हारे", "तु ारा": "तुम्हारा", "तु ारी": "तुम्हारी",
    " म  ": " में ", " पाट ": " पार्टी ", " पाट": " पार्टी", " मला": " मिला", " मली": " मिली",
    " मले": " मिले", " गलास": " गिलास", " आ खरी": " आखिरी", " कया": " किया", " कए": " किए",
    " क": " कि", "क ": "की ", "आदत ": "आदतों ", "पुर ार": "पुरस्कार", "प्र तयो गता": "प्रतियोगिता",
    "सम ा": "समस्या", " टप्प णयाँ": "टिप्पणियाँ", "संबं धत": "संबंधित", "तक  ": "तर्क ",
    "समथ न": "समर्थन", " व ास": "विश्वास", "कया": "किया", "प रवार": "परिवार", "इकलौता": "इकलौता",
    "व्यव स्थत": "व्यवस्थित", "नज़दीक ": "नज़दीकी", "स्वाथ  ": "स्वार्थी", " नकले": "निकले",
    " नरीक्षण": "निरीक्षण", "पूव ": "पूर्व", "संध्या": "संध्या", "ज़हर": "ज़हर", "अ स्तत्व": "अस्तित्व",
    " न  त": "निश्चित", " दूसर ": "दूसरों ", " च ता": "चिंता", " बना": "बिना", " लए": "लिए",
    " दोन ": "दोनों ", " हाथ ": "हाथों ", " शां त": "शांति", " व्यव ा": "व्यवस्था", " धम ": "धर्म",
    " पक्ष ": "पक्षों ", "  ारा": " द्वारा", " ववाद": "विवाद", " नयुक्त": "नियुक्त", " वश्वास": "विश्वास",
    " कज़ ": "कर्ज़", " असमथ ": "असमर्थ", " धा म क": "धार्मिक", " मामल ": "मामलों ", " अ त": "अति",
    "उ ाही": "उत्साही", "नह ": "नहीं", "नह  ": "नहीं "
}

def clean_text(t):
    for k, v in hindi_clean_map.items():
        t = t.replace(k, v)
    return t

def parse_phrasal_raw():
    raw_path = "scripts/scratch/phrasal_raw.txt"
    with open(raw_path, "r", encoding="utf-8") as f:
        text = f.read().replace('\x00', '')

    # Split by number at start of line
    # Pattern: \n(\d+)\s+([A-Z][A-Za-z/]+(?:\s+[a-z/]+)*)
    chunks = re.split(r'\n(?=\d+\s+[A-Z])', text)
    print(f"Total chunks found: {len(chunks)}")
    
    entries = []
    for c in chunks:
        c_clean = c.strip()
        m = re.match(r'^(\d+)\s+([A-Z][a-zA-Z/\-\'\s]+?)\s+([a-z].*)$', c_clean, re.DOTALL)
        if m:
            num = m.group(1).strip()
            verb = m.group(2).strip()
            rest = m.group(3).strip()
            
            # split rest into English meaning, Hindi meaning, example
            # Rest contains lines
            rest_lines = [l.strip() for l in rest.splitlines() if l.strip()]
            rest_str = " ".join(rest_lines)
            
            entries.append((num, verb, rest_str))

    print(f"Parsed {len(entries)} phrasal verbs.")
    return entries

def generate_phrasal_chapter():
    entries = parse_phrasal_raw()
    
    rows = []
    for num, verb, rest in entries:
        cleaned_rest = clean_text(rest)
        rows.append(f"""
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-slate-400 text-xs">{num}</td>
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">{verb}</td>
            <td class="p-3 text-slate-700 dark:text-slate-300 text-xs md:text-sm">{cleaned_rest}</td>
          </tr>
""")
    table_rows = "".join(rows)

    full_html = f"""
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 09 &bull; SSC English Master Vocabulary
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Phrasal Verbs (फ्रेजल वर्ब्स) &bull; Complete SSC 215+ Master List with Meanings &amp; Examples
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      Phrasal Verb वह क्रिया (Verb) है जिसके साथ कोई Preposition या Adverb (Particle) जुड़कर एक नया लाक्षणिक (Idiomatic) अर्थ बनाता है। 
      SSC परीक्षाओं में <strong>Cloze Test, Fill in the Blanks, Error Detection</strong> तथा <strong>Sentence Improvement</strong> में 
      Phrasal Verbs का योगदान निर्णायक होता है। एक छोटे-से Particle (जैसे <em>break out</em> vs <em>break down</em> vs <em>break into</em>) 
      के बदलने से पूरा अर्थ बदल जाता है।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">215+ Verbs</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">पूर्ण प्रामाणिक संकलन</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">Bilingual</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">हिंदी अर्थ + English Meaning</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">Contextual</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">वास्तविक SSC वाक्य प्रयोग</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">Exam Weightage</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Cloze Test में 3-4 प्रश्न निश्चित</span>
      </div>
    </div>
  </div>

  <!-- High-Frequency Confusion Cluster Cards -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        SSC के 4 सर्वाधिक पूछे जाने वाले Phrasal Verb Clusters
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        परीक्षा में सबसे ज्यादा भ्रम पैदा करने वाले क्रिया समूह:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Cluster 1: BREAK -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase block mb-2">Cluster 1: The 'BREAK' Family</span>
        <ul class="text-xs space-y-2 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Break down:</strong> (1) मशीन या वाहन का खराब होना | (2) रो पड़ना / हिम्मत हारना।<br>
            <em>The car broke down on the highway. / She broke down in tears.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Break into:</strong> जबरन घुसना (चोरी आदि के लिए)।<br>
            <em>The thieves broke into the jewelry shop.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Break out:</strong> अचानक फैलना (युद्ध, महामारी, आग)।<br>
            <em>Cholera broke out in the village.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Break up:</strong> संबंध समाप्त होना / बैठक का विसर्जन।</li>
        </ul>
      </div>

      <!-- Cluster 2: CALL -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase block mb-2">Cluster 2: The 'CALL' Family</span>
        <ul class="text-xs space-y-2 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Call off:</strong> रद्द करना (Cancel)।<br>
            <em>The workers decided to call off the strike.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Call on:</strong> किसी व्यक्ति से मिलने जाना (Visit a person)।<br>
            <em>I called on my friend yesterday.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Call at:</strong> किसी स्थान पर थोड़ी देर रुकना (Visit a place)।<br>
            <em>The train calls at every small station.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Call for:</strong> माँग करना / आवश्यकता होना (Demand / Require)।</li>
        </ul>
      </div>

      <!-- Cluster 3: PUT -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-2">Cluster 3: The 'PUT' Family</span>
        <ul class="text-xs space-y-2 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Put off:</strong> स्थगित करना (Postpone)।<br>
            <em>Never put off till tomorrow what you can do today.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Put out:</strong> आग या मोमबत्ती बुझाना (Extinguish)।<br>
            <em>The firemen put out the fire quickly.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Put up with:</strong> सहन या बर्दाश्त करना (Tolerate / Bear)。<br>
            <em>I cannot put up with his rude behaviour.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Put on:</strong> कपड़े पहनना / दिखावा करना।</li>
        </ul>
      </div>

      <!-- Cluster 4: LOOK -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase block mb-2">Cluster 4: The 'LOOK' Family</span>
        <ul class="text-xs space-y-2 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Look after:</strong> देखभाल करना (Take care of)。<br>
            <em>She looks after her aged parents.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Look into:</strong> जाँच-पड़ताल करना (Investigate)。<br>
            <em>The police are looking into the matter.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Look for:</strong> खोजना / तलाशना (Search)。<br>
            <em>He is looking for his lost wallet.</em></li>
          <li>&bull; <strong class="text-indigo-600 dark:text-indigo-400">Look down upon:</strong> हीन दृष्टि से देखना (Despise)。</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Master Table of 215 Phrasal Verbs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Master Phrasal Verbs Compendium (सम्पूर्ण सूची)</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">क्रमबद्ध रूप में सभी महत्वपूर्ण Phrasal Verbs, उनके अर्थ तथा उदाहरण:</p>
      </div>
      <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900">
        215 Verbs Listed
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
            <th class="p-3 font-bold w-12">#</th>
            <th class="p-3 font-bold w-1/4">Phrasal Verb</th>
            <th class="p-3 font-bold">Meaning (English + Hindi) &amp; Exam Example</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
{table_rows}
        </tbody>
      </table>
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
        SSC CGL, CHSL एवं CPO में बार-बार पूछे गए Phrasal Verb प्रश्न:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">Put up with Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> I cannot __________ his insolent behaviour any longer.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) put out</p>
          <p>(B) put up with</p>
          <p>(C) put off</p>
          <p>(D) put down</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-rose-500">
          <span class="font-bold text-rose-700 dark:text-rose-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'Put up with' का अर्थ होता है <em>बर्दाश्त करना / सहन करना (Tolerate)</em>। अतः वाक्य के संदर्भ में 'put up with' सही उत्तर है।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">Call off Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> Due to heavy rains, the cricket match had to be __________.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) called on</p>
          <p>(B) called off</p>
          <p>(C) called out</p>
          <p>(D) called in</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-indigo-500">
          <span class="font-bold text-indigo-700 dark:text-indigo-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> मैच को 'रद्द' (Cancel) करने के लिए Phrasal Verb <strong>called off</strong> का प्रयोग होता है।
        </div>
      </div>
    </div>
  </div>

  <!-- FAQs -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (Phrasal Verb FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. Phrasal Verbs को याद रखने की सबसे प्रभावी तकनीक क्या है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Phrasal Verbs को कभी सीधे रटने के बजाय <strong>Root Verb Clusters</strong> (जैसे Look, Break, Call, Put, Turn, Bring) के आधार पर पढ़ें और Particle (Off = अलगाव, Out = बाहर/बुझाना, Up = पूरा करना/बढ़ाना) के मूल भाव को समझें। प्रतिदिन 10-15 वाक्यों में इनका प्रयोग करें।
        </p>
      </details>
    </div>
  </div>

</div>
"""

    out_path = "scripts/scratch/phrasal_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated {out_path} with {len(full_html)} chars.")

if __name__ == "__main__":
    generate_phrasal_chapter()
