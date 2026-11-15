# -*- coding: utf-8 -*-
"""
Generate comprehensive, clean, bilingual HTML for Question Tags.
Includes:
- Summary hero card
- Golden rules formula
- Complete contraction table (including aren't I?, won't, shan't)
- All 13 rules explained with formulas and bilingual examples
- High-yield SSC exam traps (Negative adverbs, everyone -> they + plural verb, etc.)
- PYQs with explanations
- Interactive FAQs
"""

import os

question_tags_html = """
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 06 &bull; SSC English Master Notes
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; GD 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Question Tags (प्रश्नवाचक पूँछ) &bull; Complete SSC Rules, Contraction Charts & 13 Core Traps
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      Question Tag किसी कथन (Statement) के अंत में जोड़ा जाने वाला एक लघु प्रश्न (Mini-Question) होता है, जिसका उपयोग श्रोता से 
      पुष्टि (Confirmation) प्राप्त करने या उसका ध्यान आकर्षित करने के लिए किया जाता है (हिंदी के <em>"है न?", "क्यों?", "ठीक है?"</em> की तरह)। 
      SSC परीक्षाओं में Question Tag से निश्चित रूप से 1 से 2 प्रश्न पूछे जाते हैं। 
      इसके नियम 100% सटीक और गणितीय हैं, जहाँ ज़रा सी असावधानी (जैसे <em>I am &rarr; aren't I?</em> या <em>Everyone &rarr; haven't they?</em>) भारी पड़ सकती है।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">13 Rules</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">सम्पूर्ण नियमों का संकलन</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">Golden Rule</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">(+) Stmt &rarr; (-) Tag | (-) Stmt &rarr; (+) Tag</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">aren't I?</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">I am का Negative Tag</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">Subject Rule</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Tag Subject सदा Pronoun होगा</span>
      </div>
    </div>
  </div>

  <!-- Section 1: Concept & Golden Rule -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        Question Tag की परिभाषा एवं आधारभूत संरचना (Structure)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Question Tag अपने आप में पूर्ण प्रश्न नहीं होते, बल्कि कथन की पुष्टि (Confirmation) के लिए अंत में जोड़े जाते हैं।
      </p>
    </div>

    <!-- Golden Formula Card -->
    <div class="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
      <div class="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-2">The Golden Rule of Question Tags</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono mb-4">
        <div class="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
          <span class="text-emerald-400 font-bold block mb-1">1. Positive Statement &rarr; Negative Tag</span>
          Statement (+) , [Auxiliary + n't + Pronoun] ?<br>
          <span class="text-xs text-slate-400 font-sans mt-1 block">&bull; We are reading, <strong>aren't we?</strong> (हम पढ़ रहे हैं, है न?)</span>
          <span class="text-xs text-slate-400 font-sans block">&bull; You will do this job, <strong>won't you?</strong></span>
        </div>
        <div class="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
          <span class="text-blue-400 font-bold block mb-1">2. Negative Statement &rarr; Positive Tag</span>
          Statement (-) , [Auxiliary + Pronoun] ?<br>
          <span class="text-xs text-slate-400 font-sans mt-1 block">&bull; She is not working, <strong>is she?</strong> (वह काम नहीं कर रही, है न?)</span>
          <span class="text-xs text-slate-400 font-sans block">&bull; They had not gone there, <strong>had they?</strong></span>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
        <div class="p-2.5 bg-slate-800/70 rounded-lg">
          <strong class="text-indigo-300 block mb-1">अल्पविराम (Comma):</strong> मुख्य वाक्य और Tag के बीच हमेशा कॉमा (,) आता है।
        </div>
        <div class="p-2.5 bg-slate-800/70 rounded-lg">
          <strong class="text-indigo-300 block mb-1">Small Letter:</strong> Question Tag कभी Capital Letter से शुरू नहीं होता (छोटा अक्षर)।
        </div>
        <div class="p-2.5 bg-slate-800/70 rounded-lg">
          <strong class="text-indigo-300 block mb-1">सदा Pronoun:</strong> The subject of a tag is always a pronoun (Tag का Subject कभी Noun नहीं हो सकता, केवल Pronoun होता है)।
        </div>
      </div>
    </div>
  </div>

  <!-- Section 2: Contraction Table (सहायक क्रियाओं के संक्षिप्त रूप) -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">2</span>
        Contracted Auxiliaries Master Table (संक्षिप्त रूपों की सूची)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Negative Tag में कभी भी 'Auxiliary + not' अलग-अलग नहीं लिखा जाता। हमेशा Contracted Form (संक्षिप्त रूप) का ही प्रयोग होता है:
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
            <th class="p-2.5 font-bold">Full Form</th>
            <th class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono">Contracted</th>
            <th class="p-2.5 font-bold">Full Form</th>
            <th class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono">Contracted</th>
            <th class="p-2.5 font-bold">Full Form</th>
            <th class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono">Contracted</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-2.5 font-sans">do + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">don't</td>
            <td class="p-2.5 font-sans">does + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">doesn't</td>
            <td class="p-2.5 font-sans">did + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">didn't</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-2.5 font-sans">is + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">isn't</td>
            <td class="p-2.5 font-sans">are + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">aren't</td>
            <td class="p-2.5 font-sans text-rose-600 dark:text-rose-400 font-bold">am + not</td>
            <td class="p-2.5 font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40">aren't I? (Trap!)</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-2.5 font-sans">was + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">wasn't</td>
            <td class="p-2.5 font-sans">were + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">weren't</td>
            <td class="p-2.5 font-sans">has + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">hasn't</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-2.5 font-sans">have + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">haven't</td>
            <td class="p-2.5 font-sans">had + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">hadn't</td>
            <td class="p-2.5 font-sans text-amber-600 dark:text-amber-400 font-bold">will + not</td>
            <td class="p-2.5 font-bold text-amber-600 dark:text-amber-400">won't (Trap!)</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-2.5 font-sans text-amber-600 dark:text-amber-400 font-bold">shall + not</td>
            <td class="p-2.5 font-bold text-amber-600 dark:text-amber-400">shan't (Trap!)</td>
            <td class="p-2.5 font-sans">can + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">can't</td>
            <td class="p-2.5 font-sans">could + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">couldn't</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-2.5 font-sans">may + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">mayn't</td>
            <td class="p-2.5 font-sans">might + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">mightn't</td>
            <td class="p-2.5 font-sans">must + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">mustn't</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-2.5 font-sans">ought + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">oughtn't</td>
            <td class="p-2.5 font-sans">need + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">needn't</td>
            <td class="p-2.5 font-sans">dare + not</td>
            <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">daren't</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Alert Box: amn't does not exist -->
    <div class="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
      <div class="p-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-200">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
      </div>
      <div>
        <h3 class="text-sm font-bold text-rose-900 dark:text-rose-200">SSC Super Trap: 'amn't I?' अंग्रेजी में नहीं होता!</h3>
        <p class="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
          अंग्रेजी भाषा में <em>amn't</em> कोई शब्द नहीं है। अतः <code>I am</code> का Negative Tag सदा <strong>aren't I?</strong> बनता है।<br>
          &bull; <span class="text-slate-900 dark:text-white font-mono">I am right, <strong>aren't I?</strong></span> (Correct &mdash; 'amn't I?' बिल्कुल गलत है)<br>
          &bull; लेकिन ध्यान दें: यदि वाक्य Negative हो, तो Positive Tag में सामान्य <strong>am I?</strong> ही आएगा:<br>
          &bull; <span class="text-slate-900 dark:text-white font-mono">I am not happy, <strong>am I?</strong></span> (Correct)
        </p>
      </div>
    </div>
  </div>

  <!-- Section 3: All 13 Core Rules Breakdown -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">3</span>
        Question Tags के सभी 13 मुख्य नियम (13 Core Rules)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC द्वारा पूछे जाने वाले हर एक नियम का नियमवार विश्लेषण:
      </p>
    </div>

    <div class="space-y-4">
      <!-- Rule 1 & 2 -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          Rule 1 &amp; 2: Tag का कर्ता हमेशा Pronoun होगा &amp; Small Letter से शुरू होगा
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Tag में कभी भी Noun (संज्ञा) नहीं आ सकता। Noun के लिंग, वचन व पुरुष के अनुसार उचित Pronoun (he, she, it, they) का ही प्रयोग होता है।
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p>&bull; Ram is doing maths, <strong>isn't he?</strong> (isn't Ram गलत है)</p>
            <p>&bull; Parul has not eaten, <strong>has she?</strong> (has Parul गलत है)</p>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p>&bull; The boys were playing, <strong>weren't they?</strong> (Boys &rarr; they)</p>
            <p>&bull; The dog was barking, <strong>wasn't it?</strong> (Dog &rarr; it)</p>
          </div>
        </div>
      </div>

      <!-- Rule 4: No Auxiliary in Statement -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          Rule 4: यदि Statement में कोई Auxiliary Verb न हो &rarr; Do / Does / Did का प्रयोग
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Simple Present और Simple Past के सकारात्मक वाक्यों में Helping Verb नहीं होती। ऐसे वाक्यों में क्रिया के अनुसार <em>don't / doesn't / didn't</em> लगाया जाता है:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-slate-800 dark:text-slate-200 block mb-1">V1 &rarr; don't</span>
            &bull; You enjoyed that, <strong>didn't you?</strong> (V2)<br>
            &bull; We love it, <strong>don't we?</strong> (V1)
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-slate-800 dark:text-slate-200 block mb-1">V1+s/es &rarr; doesn't</span>
            &bull; She works in sales, <strong>doesn't she?</strong><br>
            &bull; It looks perfect there, <strong>doesn't it?</strong>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-slate-800 dark:text-slate-200 block mb-1">V2 (Past) &rarr; didn't</span>
            &bull; We went there last year, <strong>didn't we?</strong><br>
            &bull; He broke the glass, <strong>didn't he?</strong>
          </div>
        </div>
      </div>

      <!-- Rule 5: Negative Words take Positive Tag -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-base font-bold text-indigo-600 dark:text-indigo-400">
            Rule 5: नकारात्मक शब्द (Negative Words) वाले वाक्य &rarr; Positive Tag
          </h3>
          <span class="px-2 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold rounded">SSC Frequent Trap</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          यदि वाक्य में <strong>seldom, rarely, hardly, scarcely, barely, neither, none, nobody, nothing, few, little</strong> जैसे नकारात्मक शब्द हों, 
          तो वाक्य का अर्थ नकारात्मक हो जाता है &mdash; अतः इनका Tag <strong>सदा Positive (सकारात्मक)</strong> बनेगा:
        </p>
        <div class="space-y-2 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-wrap justify-between">
            <span>&bull; He <strong>seldom</strong> comes here, <strong>does he?</strong></span>
            <span class="text-slate-500">(doesn't he गलत है)</span>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-wrap justify-between">
            <span>&bull; Barking dogs <strong>seldom</strong> bite, <strong>do they?</strong></span>
            <span class="text-slate-500">(Dogs = Plural, bite = V1)</span>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-wrap justify-between">
            <span>&bull; She has <strong>little</strong> knowledge of English, <strong>has she?</strong></span>
            <span class="text-slate-500">(Little = Negative)</span>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-wrap justify-between">
            <span>&bull; <em>Trap Alert:</em> She has <strong>a little</strong> knowledge, <strong>hasn't she?</strong></span>
            <span class="text-emerald-600 dark:text-emerald-400">('a little' और 'a few' सकारात्मक होते हैं)</span>
          </div>
        </div>
      </div>

      <!-- Rule 6 & 7: Introductory & Demonstrative Subjects -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          Rule 6 &amp; 7: This, That, These, Those, There, One का Tag Subject
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="space-y-2">
            <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <strong class="text-slate-800 dark:text-slate-200">This / That &rarr; IT</strong><br>
              &bull; This is your pen, <strong>isn't it?</strong><br>
              &bull; That was not fair, <strong>was it?</strong>
            </div>
            <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <strong class="text-slate-800 dark:text-slate-200">These / Those &rarr; THEY</strong><br>
              &bull; These are lovely flowers, <strong>aren't they?</strong><br>
              &bull; Those boys are naughty, <strong>aren't they?</strong>
            </div>
          </div>
          <div class="space-y-2">
            <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <strong class="text-slate-800 dark:text-slate-200">There &rarr; THERE (बदलता नहीं)</strong><br>
              &bull; There is no water, <strong>is there?</strong><br>
              &bull; There are many boys, <strong>aren't there?</strong>
            </div>
            <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <strong class="text-slate-800 dark:text-slate-200">One &rarr; ONE (बदलता नहीं)</strong><br>
              &bull; One can do this, <strong>can't one?</strong><br>
              &bull; One should obey rules, <strong>shouldn't one?</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Rule 8: Indefinite Pronouns denoting Persons -> THEY + Plural Verb -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-base font-bold text-indigo-600 dark:text-indigo-400">
            Rule 8: Everyone, Somebody, Nobody &rarr; Tag Subject 'THEY' + Plural Verb
          </h3>
          <span class="px-2 py-0.5 text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold rounded">#1 Favorite SSC Trap</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          यदि वाक्य का कर्ता <strong>everyone, everybody, someone, somebody, no one, nobody, anyone, anybody</strong> हो, 
          तो Tag का कर्ता <strong>THEY</strong> बनता है। चूँकि 'they' बहुवचन है, इसलिए <strong>Tag की Auxiliary Verb भी Plural (बहुवचन) हो जाती है</strong>:
        </p>
        <div class="space-y-2 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; Everyone <strong>has</strong> come, <strong>haven't they?</strong> &nbsp;
            <span class="text-rose-600 dark:text-rose-400 font-bold">(hasn't they बिल्कुल गलत है!)</span>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; Somebody <strong>was</strong> making noise, <strong>weren't they?</strong> &nbsp;
            <span class="text-rose-600 dark:text-rose-400 font-bold">(wasn't they गलत है, were आएगा!)</span>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; Nobody <strong>has</strong> called, <strong>have they?</strong> &nbsp;
            <span class="text-indigo-600 dark:text-indigo-400 font-bold">(Nobody नकारात्मक है, अतः Positive Tag 'have they')</span>
          </div>
        </div>
      </div>

      <!-- Rule 9: Indefinite Pronouns denoting Things -> IT -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          Rule 9: Everything, Something, Nothing, Anything &rarr; Tag Subject 'IT'
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">
          वस्तुओं के लिए प्रयुक्त Indefinite Pronouns के लिए Tag का Subject <strong>IT</strong> होता है (एकवचन क्रिया के साथ):
        </p>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; Everything is clear, <strong>isn't it?</strong></li>
          <li>&bull; Something is missing, <strong>isn't it?</strong></li>
          <li>&bull; Nothing was left, <strong>was it?</strong> (Nothing = Negative, अतः Positive Tag)</li>
        </ul>
      </div>

      <!-- Rule 10: Expressions with Objective Pronouns -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          Rule 10: All of us, None of you, Neither of them वाले वाक्य
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">
          'Of' के बाद आने वाले Objective Pronoun के Subjective Form के अनुसार Tag का Subject तय होता है:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong>...of us &rarr; WE</strong><br>
            All of us were present, <strong>weren't we?</strong><br>
            Neither of us went there, <strong>did we?</strong>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong>...of you &rarr; YOU</strong><br>
            None of you attended the class, <strong>did you?</strong><br>
            Some of you can dance, <strong>can't you?</strong>
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong>...of them &rarr; THEY</strong><br>
            Neither of them is guilty, <strong>are they?</strong><br>
            All of them laughed, <strong>didn't they?</strong>
          </div>
        </div>
      </div>

      <!-- Rule 11 & 12: Imperative Sentences & Statements with 'Let' -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          Rule 11, 12 &amp; 13: Imperative Sentences &amp; 'Let' वाले वाक्य
        </h3>
        <div class="space-y-3 text-xs">
          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">A. Let us / Let's (प्रस्ताव / सुझाव) &rarr; shall we?</span>
            &bull; Let us go for a walk, <strong>shall we?</strong><br>
            &bull; Let's dance together, <strong>shall we?</strong>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-blue-600 dark:text-blue-400 block mb-1">B. Let him / her / them / Payal (अनुमति) &rarr; will you?</span>
            &bull; Let him dance, <strong>will you?</strong><br>
            &bull; Let them play, <strong>will you?</strong>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">C. सामान्य Imperative (Order / Request) &rarr; will you? / won't you?</span>
            &bull; Open the door, <strong>will you?</strong> (or won't you?)<br>
            &bull; Don't make noise, <strong>will you?</strong> (नकारात्मक Imperative में सदा Positive Tag 'will you')
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-rose-600 dark:text-rose-400 block mb-1">D. झुंझलाहट या नाराजगी (Annoyance / Impatience) &rarr; can't you?</span>
            &bull; Shut your mouth, <strong>can't you?</strong><br>
            &bull; Keep quiet, <strong>can't you?</strong>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 4: Solved SSC Exam PYQs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">4</span>
        SSC Previous Year Questions (PYQs with Explanations)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC CGL, CHSL एवं CPO में बार-बार पूछे गए Question Tag प्रश्न:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">aren't I? Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> I am doing my job honestly, __________?
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) amn't I</p>
          <p>(B) aren't I</p>
          <p>(C) don't I</p>
          <p>(D) isn't it</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-rose-500">
          <span class="font-bold text-rose-700 dark:text-rose-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> अंग्रेजी व्याकरण में 'amn't I' जैसा कोई शब्द नहीं है। <code>I am</code> का Negative Tag सदा <strong>aren't I</strong> होता है।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">Subject-Verb Agreement Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> Everyone has submitted the assignment, __________?
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) hasn't he</p>
          <p>(B) hasn't they</p>
          <p>(C) haven't they</p>
          <p>(D) doesn't he</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-indigo-500">
          <span class="font-bold text-indigo-700 dark:text-indigo-400">उत्तर: (C)</span> &bull; <em>Explanation:</em> 'Everyone' के लिए Tag का Pronoun <strong>they</strong> होता है। Pronoun 'they' बहुवचन होने के कारण Verb 'has' बदलकर <strong>have</strong> हो जाएगी &rarr; <em>haven't they?</em>
        </div>
      </div>

      <!-- PYQ 3 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CPO</span>
          <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">Negative Adverb Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q3:</strong> He seldom visits his hometown, __________?
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) doesn't he</p>
          <p>(B) does he</p>
          <p>(C) isn't he</p>
          <p>(D) didn't he</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-amber-500">
          <span class="font-bold text-amber-700 dark:text-amber-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'Seldom' एक नकारात्मक Adverb है, जिससे वाक्य का अर्थ Negative हो जाता है। अतः Tag <strong>सकारात्मक (Positive)</strong> होगा &rarr; <em>does he?</em>
        </div>
      </div>

      <!-- PYQ 4 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">Let's Suggestion</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q4:</strong> Let us organize a picnic, __________?
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) will you</p>
          <p>(B) shall we</p>
          <p>(C) shouldn't we</p>
          <p>(D) won't you</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-emerald-500">
          <span class="font-bold text-emerald-700 dark:text-emerald-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> जब वाक्य 'Let us' (या Let's) से शुरू हो, तो वह प्रस्ताव या सुझाव व्यक्त करता है और उसका Tag निश्चित रूप से <strong>shall we?</strong> होता है।
        </div>
      </div>
    </div>
  </div>

  <!-- Section 5: FAQs -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (Question Tag FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. क्या Question Tag में Noun (जैसे Ram, Sita, Boys) आ सकता है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          नहीं, कभी नहीं। Question Tag का Subject हमेशा एक उपयुक्त Pronoun (he, she, it, they, we, you, I, one, there) ही होता है।
        </p>
      </details>

      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q2. 'Few' और 'A few' में Question Tag का क्या अंतर है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <em>Few</em> का अर्थ 'न के बराबर' (Negative) होता है, अतः इसके साथ <strong>Positive Tag</strong> आता है (e.g., Few people came, did they?)। 
          जबकि <em>A few</em> का अर्थ 'कुछ' (Positive) होता है, अतः इसके साथ <strong>Negative Tag</strong> आता है (e.g., A few people came, didn't they?)।
        </p>
      </details>
    </div>
  </div>

</div>
"""

def main():
    print("Question Tags HTML length:", len(question_tags_html), "chars")
    out_path = "scripts/scratch/question_tags_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(question_tags_html)
    print("Saved to", out_path)

if __name__ == "__main__":
    main()
