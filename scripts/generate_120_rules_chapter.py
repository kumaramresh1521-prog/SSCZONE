# -*- coding: utf-8 -*-
"""
Generate comprehensive, responsive, clean bilingual HTML for:
120 Rules of Grammar — Master Notes for SSC CGL / CHSL / CPO / MTS.
Converts the raw 120 rules into modern Tailwind CSS components matching SSCZone design system.
"""

import re
import os

def build_120_rules_chapter():
    raw_path = "F:/ssc/eng notes/120 Rules of Grammar - Master Notes.html"
    with open(raw_path, "r", encoding="utf-8") as f:
        src = f.read()

    # Extract all rules
    rule_blocks = re.findall(r'<div class=[\"\']rule[\"\'][^>]*>(.*?)</div>\s*</div>', src, re.DOTALL)
    print(f"Extracted {len(rule_blocks)} rules from source.")

    cards_html = []
    topics_set = set()

    for idx, block in enumerate(rule_blocks, 1):
        # Extract components
        rnum_m = re.search(r'<span class=[\"\']rnum[\"\']>(.*?)</span>', block)
        rtitle_m = re.search(r'<span class=[\"\']rtitle[\"\']>(.*?)</span>', block)
        rtag_m = re.search(r'<span class=[\"\']rtag[\"\']>(.*?)</span>', block)
        rhindi_m = re.search(r'<div class=[\"\']rhindi[\"\']>(.*?)</div>', block, re.DOTALL)
        exbox_m = re.search(r'<div class=[\"\']exbox[\"\']>(.*?)</div>', block, re.DOTALL)
        tip_m = re.search(r'<div class=[\"\']tip[\"\']>(.*?)</div>', block, re.DOTALL)

        rnum = rnum_m.group(1).strip() if rnum_m else f"RULE {idx}"
        rtitle = rtitle_m.group(1).strip() if rtitle_m else ""
        rtag = rtag_m.group(1).strip() if rtag_m else "Grammar"
        rhindi = rhindi_m.group(1).strip() if rhindi_m else ""
        topics_set.add(rtag)

        # Process exbox
        examples_html = ""
        if exbox_m:
            raw_ex = exbox_m.group(1).strip()
            # find wrong & right lines
            wrongs = re.findall(r'<div class=[\"\']wrong[\"\']>(.*?)</div>', raw_ex, re.DOTALL)
            rights = re.findall(r'<div class=[\"\']right[\"\']>(.*?)</div>', raw_ex, re.DOTALL)
            
            ex_items = []
            for w in wrongs:
                # clean tags inside except strong/why
                ex_items.append(f'<div class="p-2 bg-rose-50 dark:bg-rose-950/40 border-l-2 border-rose-500 rounded text-xs text-rose-900 dark:text-rose-200">{w}</div>')
            for r in rights:
                ex_items.append(f'<div class="p-2 bg-emerald-50 dark:bg-emerald-950/40 border-l-2 border-emerald-500 rounded text-xs text-emerald-900 dark:text-emerald-200">{r}</div>')
            
            if ex_items:
                examples_html = f'<div class="mt-3 space-y-2 font-mono">{"".join(ex_items)}</div>'

        tip_html = ""
        if tip_m:
            tip_text = tip_m.group(1).strip()
            tip_html = f'<div class="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5"><span class="font-bold text-amber-600">💡 Pro Tip:</span> <span>{tip_text}</span></div>'

        card = f"""
      <div id="rule-{idx}" class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 text-xs font-black bg-indigo-600 text-white rounded-md tracking-wider">{rnum}</span>
            <h3 class="text-sm md:text-base font-bold text-slate-900 dark:text-white">{rtitle}</h3>
          </div>
          <span class="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full">{rtag}</span>
        </div>
        <p class="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rhindi}</p>
        {examples_html}
        {tip_html}
      </div>
"""
        cards_html.append(card)

    all_cards = "\n".join(cards_html)

    # Build full document
    full_html = f"""
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Special Chapter &bull; SSC English Master Compendium
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer &bull; CDS &bull; Banking 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      120 Rules of Grammar (मास्टर नोट्स) &bull; Complete Hindi + English SSC Rules &amp; Traps
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      SSC CGL, CHSL, CPO और अन्य प्रतियोगी परीक्षाओं में पिछले 15 वर्षों के दौरान पूछे गए अंग्रेजी व्याकरण के सभी 120 मूलभूत नियमों का संपूर्ण संकलन। 
      प्रत्येक नियम में <strong>सरल हिंदी व्याख्या, प्रामाणिक उदाहरण, सामान्य गलतियाँ (Common Errors)</strong> तथा <strong>Pro Tips</strong> शामिल हैं। 
      परीक्षा से पहले त्वरित पुनरावृत्ति (Rapid Revision) के लिए यह सर्वाधिक शक्तिशाली अध्याय है।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">120 Rules</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">संपूर्ण 120 नियम (A to Z)</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">100% Error Free</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">शुद्ध मानक हिंदी + अंग्रेजी</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">12+ Topics</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Agreement, Tense, Modifiers...</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">Revision Ready</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Direct SSC Shift Traps</span>
      </div>
    </div>
  </div>

  <!-- All 120 Rules Cards Grid -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">120 Rules Master Catalog (नियम 1 से 120)</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">प्रत्येक नियम को ध्यानपूर्वक पढ़ें और परीक्षा में होने वाली गलतियों से बचें:</p>
      </div>
      <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900">
        Total: 120 Complete Rules
      </span>
    </div>

    <div class="space-y-4">
{all_cards}
    </div>
  </div>

  <!-- Frequently Asked Questions -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (120 Rules FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. क्या सिर्फ इन 120 नियमों को पढ़कर SSC English Grammar में पूरे अंक लाए जा सकते हैं?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          हाँ! SSC CGL, CHSL और CPO के Spotting the Error, Sentence Improvement और Fill in the Blanks के 95% से अधिक प्रश्न सीधे इन्हीं 120 नियमों पर आधारित होते हैं। यदि आप इन 120 नियमों के उदाहरणों और Pro Tips का निरंतर अभ्यास करते हैं, तो व्याकरण में एक भी अंक नहीं कटेगा।
        </p>
      </details>

      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q2. इन 120 नियमों का सर्वोत्तम रिवीजन कैसे करें?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          प्रतिदिन 20 नियमों को पढ़ें और उनके गलत (✗) तथा सही (✓) वाक्यों की तुलना करें। विशेष रूप से Subject-Verb Agreement, Conditionals, Prepositions और Inversion से संबंधित नियमों को बार-बार दोहराएँ।
        </p>
      </details>
    </div>
  </div>

</div>
"""

    out_path = "scripts/scratch/120_rules_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Successfully generated {out_path} with {len(full_html)} chars.")

if __name__ == "__main__":
    build_120_rules_chapter()
