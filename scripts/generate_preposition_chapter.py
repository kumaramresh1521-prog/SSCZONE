# -*- coding: utf-8 -*-
"""
Generate comprehensive, clean, bilingual HTML for Prepositions.
Contains:
- Chapter Summary Hero Card
- Core concepts & Accusative Case rule
- Major Prepositional Relations (Time, Place, Direction, Agency, Manner)
- High-Frequency Confusion Pairs (Between/Among, In/Into, Beside/Besides, By/With, In Time/On Time, Since/For)
- Omission of Preposition Traps (Discuss, Enter, Order, Comprise, Resemble, Last/Next)
- Master A-to-Z Fixed Prepositions Compendium (with all high-yield SSC entries)
- SSC PYQs with explanations
- FAQs
"""

import os

preposition_html = """
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 08 &bull; SSC English Master Notes
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Prepositions (पूर्वसर्ग / संबंधबोधक) &bull; Complete SSC Rules, Confusion Pairs &amp; Master Fixed Prepositions
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      Preposition (संबंधबोधक अव्यय) वह शब्द या शब्द-समूह है जो किसी संज्ञा या सर्वनाम से पहले आकर वाक्य के अन्य शब्दों से उसका संबंध 
      (दिशा, स्थान, समय, साधन, कारण या माध्यम) स्थापित करता है। SSC CGL, CHSL, CPO और Stenographer में 
      <strong>Fill in the Blanks, Cloze Test, और Error Detection</strong> का लगभग 30% हिस्सा अकेले Preposition और 
      <strong>Fixed Prepositions</strong> पर आधारित होता है।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">350+ Words</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Master Fixed Prepositions A-Z</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">Accusative</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Preposition + Object (me, him)</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">Omission Rules</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Enter, Discuss, Order, Comprise</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">High Weightage</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Tier-1: 3-5 Qs | Tier-2: 6-10 Qs</span>
      </div>
    </div>
  </div>

  <!-- Section 1: Definition & Fundamental Grammatical Rules -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        Preposition की परिभाषा एवं आधारभूत व्याकरणिक नियम
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Preposition हमेशा अपने बाद आने वाले Noun/Pronoun का संबंध वाक्य के दूसरे Noun, Verb या Adjective से जोड़ता है:
      </p>
    </div>

    <!-- Core Rules Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">1. Prepositional Object (Accusative Case)</div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Preposition के बाद आने वाला Noun या Pronoun हमेशा <strong>Objective / Accusative Case</strong> में रहता है (I &rarr; me, he &rarr; him):<br>
          &bull; The book is on the table. (table = object)<br>
          &bull; I did not talk to <strong>him</strong>. (to he गलत है)<br>
          &bull; Distribute between you and <strong>me</strong>. (between you and I गलत है)
        </p>
      </div>

      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">2. Preposition + Gerund (V1+ing)</div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          यदि Preposition के तुरंत बाद कोई क्रिया (Verb) आती है, तो वह अनिवार्य रूप से <strong>Gerund (V1+ing)</strong> के रूप में आती है (To को छोड़कर):<br>
          &bull; He is fond of <strong>reading</strong> books.<br>
          &bull; She prevented me from <strong>going</strong> there.<br>
          &bull; He was punished for <strong>telling</strong> lies.
        </p>
      </div>

      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">3. End Position with Infinitive</div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          जब Noun के बाद कोई Infinitive (To + V1) उसके उद्देश्य या साधन को व्यक्त करे, तो उचित Preposition वाक्य के अंत में आता है:<br>
          &bull; I have no house to <strong>live in</strong>.<br>
          &bull; Give me a pen to <strong>write with</strong>.<br>
          &bull; He is a man you can <strong>rely upon</strong>.
        </p>
      </div>
    </div>
  </div>

  <!-- Section 2: High-Frequency Confusion Pairs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">2</span>
        Preposition के 8 सबसे बड़े भ्रमकारी युग्म (Confusion Pairs)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC परीक्षाओं में सबसे अधिक प्रश्न इन समान अर्थ वाले Prepositions के अंतर पर पूछे जाते हैं:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 1. Between vs Among -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">1. Between vs. Among / Amongst</h3>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Between:</strong> सामान्यतः <strong>दो</strong> व्यक्तियों या वस्तुओं के लिए।<br>
            <em>Divide this apple between Ram and Shyam.</em></li>
          <li>&bull; <strong>Among:</strong> <strong>दो से अधिक</strong> व्यक्तियों या वस्तुओं के लिए।<br>
            <em>Distribute the sweets among the children.</em></li>
          <li>&bull; <span class="text-amber-600 dark:text-amber-400 font-bold">SSC Trap:</span> दो से अधिक होने पर भी यदि उनके बीच कोई <strong>आपसी समझौता या संबंध (Reciprocal Relationship)</strong> हो, तो <strong>Between</strong> ही आता है:<br>
            <em>There is a treaty between the four nations. (not among)</em></li>
        </ul>
      </div>

      <!-- 2. In vs Into -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">2. In vs. Into (स्थिरता बनाम गति)</h3>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>In (अंदर &bull; स्थिरता):</strong> पहले से ही किसी सीमा के भीतर स्थिर होना।<br>
            <em>She is sitting in the room. / He swims in the river.</em></li>
          <li>&bull; <strong>Into (अंदर की ओर गति / माध्यम परिवर्तन):</strong> बाहर से अंदर की ओर गति या अवस्था बदलना।<br>
            <em>The frog jumped <strong>into</strong> the pond. / Translate this passage <strong>into</strong> English.</em></li>
          <li>&bull; <span class="text-rose-600 dark:text-rose-400 font-bold">Trap:</span> <em>Enter</em> के साथ स्थान में प्रवेश के लिए <strong>into नहीं लगता</strong> (He entered the room, not entered into)।</li>
        </ul>
      </div>

      <!-- 3. Beside vs Besides -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">3. Beside vs. Besides (बगल में बनाम के अलावा)</h3>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Beside:</strong> पास में / बगल में (By the side of)।<br>
            <em>Go and sit <strong>beside</strong> your mother. (अपनी माँ के बगल में बैठो)</em></li>
          <li>&bull; <strong>Besides:</strong> के अतिरिक्त / के अलावा (In addition to)।<br>
            <em><strong>Besides</strong> English, he can speak French. (अंग्रेजी के अलावा)</em></li>
        </ul>
      </div>

      <!-- 4. By vs With -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase mb-2">4. By vs. With (कर्ता बनाम उपकरण / हथियार)</h3>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>By:</strong> कार्य करने वाले सजीव कर्ता (Agent / Doer) के लिए।<br>
            <em>The tiger was killed <strong>by</strong> the hunter.</em></li>
          <li>&bull; <strong>With:</strong> जिस उपकरण, औज़ार या हथियार (Instrument / Tool) से कार्य हुआ।<br>
            <em>The hunter killed the tiger <strong>with</strong> a gun. (not by a gun)</em><br>
            <em>She wrote the letter <strong>with</strong> a pen.</em></li>
        </ul>
      </div>

      <!-- 5. In Time vs On Time -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase mb-2">5. In Time vs. On Time (समय पर)</h3>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>On Time:</strong> निश्चित तय समय पर, न पहले न बाद में (Punctual)।<br>
            <em>The Rajdhani train arrived exactly <strong>on time</strong> (at 5:00 PM).</em></li>
          <li>&bull; <strong>In Time:</strong> समय रहते, अंतिम समय से कुछ पहले (Before deadline)।<br>
            <em>Passengers should reach the station <strong>in time</strong> for the train.</em></li>
        </ul>
      </div>

      <!-- 6. Since vs For vs From -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">6. Since vs. For vs. From (समय के लिए)</h3>
        <ul class="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>&bull; <strong>Since:</strong> Point of Time (निश्चित समय) &mdash; Perfect &amp; Perfect Cont. Tenses में।<br>
            <em>He has been waiting <strong>since</strong> 4 PM / Monday / 2020.</em></li>
          <li>&bull; <strong>For:</strong> Period of Time (समय की अवधि / संख्या)।<br>
            <em>She has been ill <strong>for</strong> three days / two months.</em></li>
          <li>&bull; <strong>From:</strong> Future Tense में Point of Time के लिए 'Since' नहीं, <strong>From</strong> आता है:<br>
            <em>He will start the preparation <strong>from</strong> tomorrow. (not since tomorrow)</em></li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Section 3: Omission of Prepositions (No Preposition Traps) -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">3</span>
        Omission of Prepositions &bull; जहाँ Preposition लगाना अपराध है!
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC परीक्षाओं में 25% गलतियाँ उन क्रियाओं में Preposition जोड़ने से होती हैं जो सकर्मक (Transitive) होती हैं और सीधे Object लेती हैं:
      </p>
    </div>

    <div class="p-5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
      <h3 class="text-sm font-bold text-rose-900 dark:text-rose-200 uppercase mb-3">
        इन क्रियाओं के बाद Active Voice में कोई Preposition नहीं आता:
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div class="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
          <strong class="text-slate-900 dark:text-white">Discuss / Describe</strong><br>
          &bull; <em>Incorrect:</em> Discuss about the problem.<br>
          &bull; <em>Correct:</em> <strong>Discuss the problem.</strong>
        </div>
        <div class="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
          <strong class="text-slate-900 dark:text-white">Enter (कमरे / इमारत में)</strong><br>
          &bull; <em>Incorrect:</em> He entered into the hall.<br>
          &bull; <em>Correct:</em> <strong>He entered the hall.</strong><br>
          <span class="text-[10px] text-slate-500">(Enter into agreement/treaty सही है)</span>
        </div>
        <div class="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
          <strong class="text-slate-900 dark:text-white">Order (भोजन / सामान)</strong><br>
          &bull; <em>Incorrect:</em> He ordered for two cups of tea.<br>
          &bull; <em>Correct:</em> <strong>He ordered two cups of tea.</strong>
        </div>
        <div class="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
          <strong class="text-slate-900 dark:text-white">Comprise</strong><br>
          &bull; <em>Incorrect:</em> The book comprises of 10 units.<br>
          &bull; <em>Correct:</em> <strong>The book comprises 10 units.</strong><br>
          <span class="text-[10px] text-slate-500">(Consist of सही है; is comprised of भी सही है)</span>
        </div>
        <div class="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
          <strong class="text-slate-900 dark:text-white">Resemble</strong><br>
          &bull; <em>Incorrect:</em> She resembles with/to her mother.<br>
          &bull; <em>Correct:</em> <strong>She resembles her mother.</strong>
        </div>
        <div class="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
          <strong class="text-slate-900 dark:text-white">Tell / Ask / Inform / Advise</strong><br>
          &bull; <em>Incorrect:</em> He told to me / asked to him.<br>
          &bull; <em>Correct:</em> <strong>He told me / asked him.</strong>
        </div>
      </div>

      <!-- Time Expression Trap -->
      <div class="mt-4 p-3 bg-white dark:bg-slate-900 rounded-lg text-xs">
        <strong class="text-amber-600 dark:text-amber-400 block mb-1">Time Expressions Trap (Today, Tomorrow, Yesterday, Last, Next):</strong>
        यदि समयसूचक शब्दों के पहले <em>today, yesterday, tomorrow, next, last, this, that, every</em> लगा हो, तो <code>on, in, at</code> नहीं लगता:<br>
        &bull; <em>Incorrect:</em> He arrived on last Sunday. &rarr; <em>Correct:</em> <strong>He arrived last Sunday.</strong><br>
        &bull; <em>Incorrect:</em> I met him in yesterday morning. &rarr; <em>Correct:</em> <strong>I met him yesterday morning.</strong>
      </div>
    </div>
  </div>

  <!-- Section 4: Master A-to-Z Fixed Prepositions Compendium -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">4</span>
        SSC Master Fixed Prepositions Compendium (A to Z सर्वाधिक पूछे जाने वाले शब्द)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        ये वे निश्चित Prepositions हैं जो अंग्रेजी भाषा में विशिष्ट Verbs, Nouns और Adjectives के साथ जुड़कर स्थिर रहते हैं:
      </p>
    </div>

    <!-- Letter-wise Fixed Preposition Tables -->
    <div class="space-y-4">
      <!-- Section A to C -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
              <th class="p-2.5 font-bold w-1/4">Fixed Preposition</th>
              <th class="p-2.5 font-bold w-1/4">हिंदी अर्थ / व्याख्या</th>
              <th class="p-2.5 font-bold">प्रामाणिक वाक्य (SSC Pattern Example)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Abide by</td>
              <td class="p-2.5">नियम का पालन करना</td>
              <td class="p-2.5">You must <strong>abide by</strong> the rules of the committee.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Accused of</td>
              <td class="p-2.5">दोषी ठहराना / आरोप लगाना</td>
              <td class="p-2.5">He was <strong>accused of</strong> theft. (not accused for)</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Accustomed to</td>
              <td class="p-2.5">आदी होना (Used to)</td>
              <td class="p-2.5">He is <strong>accustomed to</strong> hard work.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Addicted to</td>
              <td class="p-2.5">लत लगना (शराब, जुआ आदि)</td>
              <td class="p-2.5">He is <strong>addicted to</strong> gambling.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Agree with (Person)</td>
              <td class="p-2.5">किसी व्यक्ति से सहमत होना</td>
              <td class="p-2.5">I <strong>agree with</strong> you on this point.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Agree to (Proposal)</td>
              <td class="p-2.5">किसी प्रस्ताव / योजना से सहमत</td>
              <td class="p-2.5">He <strong>agreed to</strong> my proposal.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Aim at</td>
              <td class="p-2.5">निशाना साधना</td>
              <td class="p-2.5">He <strong>aimed at</strong> the bird.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Blind in / of (eye)</td>
              <td class="p-2.5">आँख से अंधा</td>
              <td class="p-2.5">He is <strong>blind in</strong> the left eye.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Blind to (faults)</td>
              <td class="p-2.5">कमियों / गलतियों से अनजान</td>
              <td class="p-2.5">Parents should not be <strong>blind to</strong> their children's faults.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Comply with</td>
              <td class="p-2.5">आज्ञा या नियम का पालन करना</td>
              <td class="p-2.5">You must <strong>comply with</strong> our instructions.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Congratulate on</td>
              <td class="p-2.5">बधाई देना (सफलता पर)</td>
              <td class="p-2.5">I <strong>congratulated him on</strong> his great success. (not for)</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Cope with</td>
              <td class="p-2.5">निपटना / सामना करना</td>
              <td class="p-2.5">He cannot <strong>cope with</strong> the heavy workload. (<em>cope up with गलत है!</em>)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section D to L -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
              <th class="p-2.5 font-bold w-1/4">Fixed Preposition</th>
              <th class="p-2.5 font-bold w-1/4">हिंदी अर्थ / व्याख्या</th>
              <th class="p-2.5 font-bold">प्रामाणिक वाक्य (SSC Pattern Example)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Deal in (Trade)</td>
              <td class="p-2.5">व्यापार करना (किराना, कपड़ा आदि)</td>
              <td class="p-2.5">My uncle <strong>deals in</strong> garments.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Deal with (Person/Matter)</td>
              <td class="p-2.5">व्यवहार करना / मसला हल करना</td>
              <td class="p-2.5">How do you <strong>deal with</strong> troublesome clients?</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Die of (Disease)</td>
              <td class="p-2.5">बीमारी से मरना (Cancer, Cholera)</td>
              <td class="p-2.5">He <strong>died of</strong> cancer. (not from cancer)</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Die from (Reason)</td>
              <td class="p-2.5">कारण से मरना (Overeating, Thirst)</td>
              <td class="p-2.5">He <strong>died from</strong> thirst and fatigue.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Differ with (Person)</td>
              <td class="p-2.5">व्यक्ति से मतभेद होना</td>
              <td class="p-2.5">I <strong>differ with</strong> you on this issue.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Differ from (Thing)</td>
              <td class="p-2.5">अलग या भिन्न होना</td>
              <td class="p-2.5">This book <strong>differs from</strong> that one.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Dispose of</td>
              <td class="p-2.5">बेचना / निपटाना</td>
              <td class="p-2.5">He decided to <strong>dispose of</strong> his old car. (<em>dispose off गलत है!</em>)</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Eligible for</td>
              <td class="p-2.5">योग्य होना</td>
              <td class="p-2.5">You are <strong>eligible for</strong> this post.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Fond of</td>
              <td class="p-2.5">शौकीन होना</td>
              <td class="p-2.5">Children are <strong>fond of</strong> sweets.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Good at</td>
              <td class="p-2.5">निपुण / अच्छा होना</td>
              <td class="p-2.5">She is <strong>good at</strong> mathematics. (good in गलत है)</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Insist on</td>
              <td class="p-2.5">ज़ोर देना / आग्रह करना</td>
              <td class="p-2.5">He <strong>insisted on</strong> paying the bill.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Jealous of</td>
              <td class="p-2.5">ईर्ष्या करना</td>
              <td class="p-2.5">He is <strong>jealous of</strong> his neighbor's wealth.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section P to Z -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
              <th class="p-2.5 font-bold w-1/4">Fixed Preposition</th>
              <th class="p-2.5 font-bold w-1/4">हिंदी अर्थ / व्याख्या</th>
              <th class="p-2.5 font-bold">प्रामाणिक वाक्य (SSC Pattern Example)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Part from (Person)</td>
              <td class="p-2.5">किसी व्यक्ति से बिछड़ना</td>
              <td class="p-2.5">She wept bitterly when she <strong>parted from</strong> her mother.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Part with (Property/Thing)</td>
              <td class="p-2.5">अपनी किसी वस्तु को छोड़ना / अलग करना</td>
              <td class="p-2.5">A miser cannot <strong>part with</strong> his money.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Prevent / Prohibit from</td>
              <td class="p-2.5">रोकना / मना करना (+ V1+ing)</td>
              <td class="p-2.5">He was <strong>prevented from entering</strong> the campus.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Refrain / Abstain from</td>
              <td class="p-2.5">बचना / परहेज़ करना (+ V1+ing)</td>
              <td class="p-2.5">You should <strong>abstain from</strong> smoking.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Senior / Junior / Superior to</td>
              <td class="p-2.5">वरिष्ठ / कनिष्ठ होना (Than नहीं)</td>
              <td class="p-2.5">He is <strong>senior to</strong> me by three years.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Suffer from</td>
              <td class="p-2.5">पीड़ित होना (Fever, illness)</td>
              <td class="p-2.5">He has been <strong>suffering from</strong> fever for two days.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Tired of</td>
              <td class="p-2.5">थक जाना / तंग आ जाना</td>
              <td class="p-2.5">I am <strong>tired of</strong> your complaints.</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Wait for (Person/Thing)</td>
              <td class="p-2.5">प्रतीक्षा करना (= Await, no for)</td>
              <td class="p-2.5">I am <strong>waiting for</strong> the bus. (<em>awaiting for गलत है</em>)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Section 5: Solved SSC Exam PYQs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">5</span>
        SSC Previous Year Questions (PYQs with Explanations)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC CGL, CHSL एवं CPO में बार-बार पूछे गए वास्तविक Preposition प्रश्न:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">Cope with Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> It is difficult to cope up with the new syllabus. Find error.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) It is difficult</p>
          <p>(B) to cope up with</p>
          <p>(C) the new syllabus</p>
          <p>(D) No error</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-rose-500">
          <span class="font-bold text-rose-700 dark:text-rose-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> अंग्रेजी में 'cope up with' जैसा कोई मुहावरा नहीं है। सही Phrasal Verb केवल <strong>cope with</strong> होती है ('up' हटाएँ)।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">Dispose of Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> He has decided to dispose __________ his ancestral property.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) off</p>
          <p>(B) of</p>
          <p>(C) out</p>
          <p>(D) away</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-indigo-500">
          <span class="font-bold text-indigo-700 dark:text-indigo-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> किसी वस्तु को बेचने या निपटाने के लिए <strong>dispose of</strong> (एक 'f') आता है। 'Dispose off' पूरी तरह गलत है।
        </div>
      </div>

      <!-- PYQ 3 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CPO</span>
          <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">Congratulate on Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q3:</strong> I congratulated him __________ his grand promotion.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) for</p>
          <p>(B) on</p>
          <p>(C) at</p>
          <p>(D) with</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-amber-500">
          <span class="font-bold text-amber-700 dark:text-amber-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'Congratulate' और 'Compliment' के बाद सफलता पर <strong>on</strong> आता है, 'for' नहीं (congratulate on success)।
        </div>
      </div>

      <!-- PYQ 4 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-2</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">Omission Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q4:</strong> The committee discussed about the matter for two hours. Find error.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) The committee</p>
          <p>(B) discussed about</p>
          <p>(C) the matter for</p>
          <p>(D) two hours</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-emerald-500">
          <span class="font-bold text-emerald-700 dark:text-emerald-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'Discuss' एक सकर्मक क्रिया (Transitive Verb) है, जिसके बाद सीधे Object आता है &mdash; <strong>'about' का प्रयोग सुपरफ्लूअस (गलत) है</strong>।
        </div>
      </div>
    </div>
  </div>

  <!-- Section 6: FAQs -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (Preposition FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. 'Die of' और 'Die from' में क्या अंतर है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          जब किसी व्यक्ति की मृत्यु किसी <strong>बीमारी (Disease)</strong> से होती है &mdash; जैसे Cancer, Malaria, Heart Attack &mdash; तो <strong>Die of</strong> आता है (e.g. <em>He died of cancer</em>)।<br>
          लेकिन जब मृत्यु बीमारी के अलावा किसी <strong>अन्य कारण (External Cause)</strong> से होती है &mdash; जैसे Overeating, Wound, Thirst, Poison &mdash; तो <strong>Die from</strong> आता है (e.g. <em>He died from overeating</em>)।
        </p>
      </details>

      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q2. क्या 'Enter' के साथ कभी 'into' आ सकता है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          भौतिक स्थान (कमरा, भवन, कक्षा आदि) में प्रवेश करते समय <strong>into कभी नहीं आता</strong> (e.g. <em>He entered the room</em> &mdash; correct)।<br>
          परंतु किसी <strong>समझौते, संधि, गठबंधन या चर्चा (Agreement, Alliance, Discussion)</strong> में प्रवेश करने पर 'into' का प्रयोग <strong>पूर्णतः सही</strong> होता है (e.g. <em>India entered into a pact with Japan</em>)।
        </p>
      </details>
    </div>
  </div>

</div>
"""

def main():
    print("Preposition HTML length:", len(preposition_html), "chars")
    out_path = "scripts/scratch/preposition_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(preposition_html)
    print("Saved to", out_path)

if __name__ == "__main__":
    main()
