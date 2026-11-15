# -*- coding: utf-8 -*-
"""
Generate comprehensive, clean, bilingual HTML for Modal Auxiliaries (Modals).
Includes:
- Summary hero card
- Modal vs Primary Auxiliary breakdown
- Master table of all Modals with Functions & Examples
- Deep dive into May/Might, Can/Could, Should, Must, Ought to
- Semi-modals: Used to, Would, Need, Dare, Has/Have to, Is/Are to
- Perfect Modals (May have, Should have, Must have, Could have, Need not have + V3)
- SSC Top Exam Traps (lest...should, used to vs be used to + V1+ing, would rather...than)
- PYQs with explanations & FAQs
"""

import os

modals_html = """
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 07 &bull; SSC English Master Notes
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Modal Auxiliaries (मॉडल सहायक क्रियाएँ) &bull; Complete SSC Rules, Perfect Modals &amp; Marginal Verbs
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      Modal Auxiliary वह सहायक क्रिया है जो वक्ता (Speaker) के मनोभाव (Mood / Attitude) को व्यक्त करती है &mdash; जैसे 
      <strong>क्षमता (Ability), संभावना (Possibility), अनुमति (Permission), बाध्यता (Compulsion), सलाह (Advice)</strong> तथा <strong>कर्तव्य (Duty)</strong>। 
      SSC परीक्षाओं में Modals से संबंधित प्रश्न Error Spotting, Sentence Improvement और Fill in the Blanks में सबसे सूक्ष्म नियमों 
      (जैसे <em>Lest + Should</em>, <em>Be used to + V1+ing</em>, <em>Would rather... than</em> तथा <em>Need not have + V3</em>) पर पूछे जाते हैं।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">Modal + V1</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">सदा Base Form (Bare Infinitive)</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">No -s/es/ed</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Subject के Number/Person से अप्रभावित</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">Perfect Modals</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Should/Must/Could have + V3</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">Semi-Modals</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Used to &bull; Need &bull; Dare</span>
      </div>
    </div>
  </div>

  <!-- Section 1: Classification & Characteristics of Modals -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        Auxiliary Verbs के प्रकार एवं Modals की मूलभूत विशेषताएँ
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        अंग्रेजी व्याकरण में सहायक क्रियाएँ (Auxiliary Verbs) मुख्य रूप से दो वर्गों में विभाजित होती हैं:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          (A) Primary Auxiliaries (मूल सहायक क्रियाएँ)
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          <strong>Be (is, am, are, was, were), Do (do, does, did), Have (has, have, had)</strong>।<br>
          ये सहायक क्रिया और मुख्य क्रिया (Main Verb) दोनों के रूप में कार्य कर सकती हैं। ये Subject के Number और Person के अनुसार बदलती हैं।
        </p>
        <div class="text-xs space-y-1 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg">
          <p>&bull; He <em>is</em> playing. (Helping Verb) | He <em>is</em> honest. (Main Verb)</p>
          <p>&bull; I <em>have</em> done it. (Helping Verb) | I <em>have</em> a car. (Main Verb)</p>
        </div>
      </div>

      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
          (B) Modal Auxiliaries (भावसूचक क्रियाएँ)
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          <strong>Can, Could, May, Might, Shall, Should, Will, Would, Must, Ought to</strong>।<br>
          ये अकेले कभी Main Verb का काम नहीं करतीं, बल्कि Main Verb की सहायता करती हैं।
        </p>
        <div class="text-xs space-y-1 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg">
          <p>&bull; You <em>should go</em> for a morning walk. (सलाह / Suggestion)</p>
          <p>&bull; They <em>must attend</em> the meeting. (अनिवार्यता / Compulsion)</p>
        </div>
      </div>
    </div>

    <!-- 3 Golden Rules of Modals -->
    <div class="p-5 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
      <div class="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-2">3 Golden Rules of Modal Verbs</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <strong class="text-indigo-300 block mb-1">Rule 1: Modal + V1 (Bare Infinitive)</strong>
          Modal के बाद हमेशा क्रिया का पहला रूप (V1) आता है। कभी भी V2, V3 या V1+ing सीधे नहीं आता (जैसे <em>can do</em>, not <em>can did</em>)।
        </div>
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <strong class="text-indigo-300 block mb-1">Rule 2: No 's/es/ed/ing' on Modals</strong>
          Modals में कभी 's' या 'ed' नहीं जुड़ता (जैसे <em>mays, cans, shoulded</em> गलत हैं)।
        </div>
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <strong class="text-indigo-300 block mb-1">Rule 3: No 'To' (Except Ought to &amp; Used to)</strong>
          Modals के बाद 'to' नहीं लगता (जैसे <em>He can to go</em> गलत है &rarr; <em>He can go</em> सही है)।
        </div>
      </div>
    </div>
  </div>

  <!-- Section 2: Master Function Chart -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">2</span>
        Modals एवं उनके अर्थ / कार्यों की मास्टर तालिका (Functions Chart)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        कौन-सा Modal किस भाव को व्यक्त करता है, इसका सम्पूर्ण अवलोकन:
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
            <th class="p-3 font-bold">Modal Verb</th>
            <th class="p-3 font-bold">मुख्य भाव / कार्य (Function)</th>
            <th class="p-3 font-bold">हिंदी अर्थ</th>
            <th class="p-3 font-bold">प्रामाणिक उदाहरण</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Can</td>
            <td class="p-3">Present Ability, Informal Permission, Prohibition (Cannot)</td>
            <td class="p-3">सकता है (क्षमता)</td>
            <td class="p-3">I <strong>can</strong> solve this puzzle.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Could</td>
            <td class="p-3">Past Ability, Polite Request (Present)</td>
            <td class="p-3">सका / सकता था / क्या आप...</td>
            <td class="p-3"><strong>Could</strong> you lend me your pen, please?</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">May</td>
            <td class="p-3">Formal Permission, Good Possibility (50%), Wish/Prayer, Purpose</td>
            <td class="p-3">सकता है (संभावना/अनुमति)</td>
            <td class="p-3">It <strong>may</strong> rain today. / <strong>May</strong> you live long!</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Might</td>
            <td class="p-3">Weak/Remote Possibility (20%), Past of May</td>
            <td class="p-3">शायद ही (क्षीण संभावना)</td>
            <td class="p-3">The sky is clear, but it <strong>might</strong> rain.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Should</td>
            <td class="p-3">Advice, Moral Suggestion, Lest + Should</td>
            <td class="p-3">चाहिए (सलाह)</td>
            <td class="p-3">You <strong>should</strong> help the needy.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Must</td>
            <td class="p-3">Compulsion, Strong Necessity, 100% Deduction/Inference</td>
            <td class="p-3">अवश्य चाहिए / ज़रूर होगा</td>
            <td class="p-3">He has a Mercedes; he <strong>must be</strong> rich.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Ought to</td>
            <td class="p-3">Moral Duty, Social Obligation</td>
            <td class="p-3">चाहिए (नैतिक कर्तव्य)</td>
            <td class="p-3">We <strong>ought to</strong> respect our parents.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Would</td>
            <td class="p-3">Polite Request, Past Habit, Preference (would rather), Wish</td>
            <td class="p-3">करता था / चाहेंगे</td>
            <td class="p-3">I <strong>would rather</strong> die than beg.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Used to</td>
            <td class="p-3">Past Discontinued Habit</td>
            <td class="p-3">किया करता था (अब नहीं)</td>
            <td class="p-3">He <strong>used to</strong> smoke five cigarettes a day.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Need</td>
            <td class="p-3">Requirement / Necessity (Modal in Negative &amp; Interrogative)</td>
            <td class="p-3">ज़रूरत / आवश्यकता</td>
            <td class="p-3">You <strong>need not</strong> worry about this.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Dare</td>
            <td class="p-3">Courage / Boldness (Modal in Negative &amp; Interrogative)</td>
            <td class="p-3">हिम्मत / साहस</td>
            <td class="p-3">How <strong>dare</strong> you touch my phone?</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Section 3: Detailed Rules Breakdown -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">3</span>
        मुख्य Modals का गहन तुलनात्मक अध्ययन (Deep Dive Analysis)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        समान दिखने वाले Modals में अंतर जहाँ छात्र सबसे अधिक भ्रमित होते हैं:
      </p>
    </div>

    <div class="space-y-4">
      <!-- 1. May vs Might -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          1. May vs. Might (संभावना व अनुमति में अंतर)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong class="text-indigo-600 dark:text-indigo-400 block mb-1">MAY (अच्छी संभावना &bull; 50% Possibility):</strong>
            &bull; It <em>may</em> rain today. (आसमान में बादल हैं, बारिश की अच्छी संभावना है)<br>
            &bull; May I come in, sir? (औपचारिक अनुमति &mdash; Formal Permission)<br>
            &bull; We eat so that we <em>may</em> live. (उद्देश्य &mdash; Purpose)
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong class="text-indigo-600 dark:text-indigo-400 block mb-1">MIGHT (क्षीण संभावना &bull; Remote Possibility):</strong>
            &bull; The sky is clear, but it <em>might</em> rain. (मौसम साफ है, बारिश की न के बराबर संभावना है)<br>
            &bull; She said that she <em>might</em> go to Delhi. (Indirect Speech में May का Past form)<br>
            &bull; Might I ask a question? (अत्यंत संकोचपूर्ण व विनम्र प्रश्न)
          </div>
        </div>
      </div>

      <!-- 2. Can vs Could vs Was able to -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          2. Can vs. Could vs. Was/Were Able To (क्षमता और विशेष प्रयास में अंतर)
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">
          SSC Exam Trap: भूतकाल की सामान्य क्षमता (General Ability) के लिए <code>could</code> आता है, 
          लेकिन किसी <strong>एक विशिष्ट कठिन परिस्थिति में सफल होने (Specific Achievement)</strong> के लिए <code>was/were able to</code> आता है:
        </p>
        <div class="space-y-2 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; When I was young, I <strong>could</strong> run fast. (सामान्य क्षमता &mdash; General Ability in Past)
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; The fire spread quickly, but all people <strong>were able to escape</strong>. (विशेष घटना में सफलता &mdash; 'could escape' व्याकरणिक रूप से कमजोर है)
          </div>
        </div>
      </div>

      <!-- 3. Should vs Must vs Ought to -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          3. Should vs. Must vs. Ought to (सलाह, मजबूरी और नैतिक कर्तव्य)
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong class="text-slate-800 dark:text-slate-200 block mb-1">Should (सामान्य सलाह):</strong>
            वक्ता की व्यक्तिगत राय या सलाह:<br>
            &bull; You <em>should</em> take rest now.<br>
            &bull; You <em>should</em> not eat junk food.
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong class="text-slate-800 dark:text-slate-200 block mb-1">Must (बाध्यता / पक्का निष्कर्ष):</strong>
            नियम, कानून या पक्का अनुमान:<br>
            &bull; You <em>must</em> wear a helmet.<br>
            &bull; Light is on; he <em>must</em> be inside.
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong class="text-slate-800 dark:text-slate-200 block mb-1">Ought to (नैतिक कर्तव्य):</strong>
            समाज, देश या बड़ों के प्रति दायित्व:<br>
            &bull; We <em>ought to</em> respect elders.<br>
            &bull; We <em>ought to</em> serve our nation.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 4: Perfect Modals (बीते समय के कार्य) -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">4</span>
        Perfect Modals (Modal + Have + V3) &bull; भूतकाल की अपूर्ण घटनाएँ
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        जब भूतकाल की किसी ऐसी घटना की बात हो जो हो सकती थी लेकिन नहीं हुई, या पक्का अनुमान हो:
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
            <th class="p-3 font-bold">Structure</th>
            <th class="p-3 font-bold">अर्थ / भाव (Sense)</th>
            <th class="p-3 font-bold">उदाहरण</th>
            <th class="p-3 font-bold">वास्तविक स्थिति (Reality)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">Should have + V3</td>
            <td class="p-3">करना चाहिए था (कर्तव्य अधूरा रहा)</td>
            <td class="p-3">You <strong>should have studied</strong> harder.</td>
            <td class="p-3 text-slate-500">लेकिन तुमने पढ़ाई नहीं की।</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">Could have + V3</td>
            <td class="p-3">कर सकता था (क्षमता थी, पर नहीं किया)</td>
            <td class="p-3">He <strong>could have won</strong> the match.</td>
            <td class="p-3 text-slate-500">लेकिन वह नहीं जीता।</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">Must have + V3</td>
            <td class="p-3">ज़रूर किया होगा (पक्का अनुमान / Strong Deduction)</td>
            <td class="p-3">He <strong>must have reached</strong> Mumbai.</td>
            <td class="p-3 text-slate-500">ट्रेन 2 घंटे पहले पहुँच चुकी है।</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">Need not have + V3</td>
            <td class="p-3">करने की ज़रूरत नहीं थी (परंतु कर दिया)</td>
            <td class="p-3">You <strong>need not have bought</strong> the umbrella.</td>
            <td class="p-3 text-slate-500">बारिश नहीं हुई, व्यर्थ में छाता खरीदा।</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Section 5: Marginal Auxiliaries (Used to, Would, Need, Dare) -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">5</span>
        Marginal Modals / Semi-Modals (Used to, Would, Need, Dare)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        ये क्रियाएँ कभी Modal तो कभी Main Verb / Adjective के रूप में कार्य करती हैं:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Used to vs Be used to -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Used to vs. Be Used to</span>
          <span class="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded font-bold">Frequent SSC Trap</span>
        </div>
        <div class="space-y-2 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong class="text-slate-800 dark:text-slate-200">1. Subject + used to + V1 (पुरानी आदत):</strong><br>
            &bull; He <em>used to play</em> cricket daily. (पुरानी आदत, अब नहीं खेलता &mdash; V1 आएगा)
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <strong class="text-rose-700 dark:text-rose-400">2. Subject + is/am/are/was/were + used to + V1+ing (आदी होना / Accustomed):</strong><br>
            &bull; He is <em>used to working</em> hard. ('is used to' के बाद V1+ing आता है &mdash; working, not work!)
          </div>
        </div>
      </div>

      <!-- Would Uses -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase block mb-2">Would के 4 मुख्य प्रयोग</span>
        <div class="space-y-2 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; <strong>विनम्र अनुरोध:</strong> <em>Would you please</em> help me?<br>
            &bull; <strong>पुरानी आदत:</strong> In winter, he <em>would sit</em> in the sun for hours.<br>
            &bull; <strong>पसंद (Preference):</strong> I <em>would rather</em> study <em>than</em> sleep.<br>
            &bull; <strong>काल्पनिक शर्त:</strong> If I were rich, I <em>would help</em> the poor.
          </div>
        </div>
      </div>

      <!-- Need: Modal vs Main Verb -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-2">Need: Modal vs. Main Verb</span>
        <div class="space-y-2 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; <strong>Modal रूप (Negative &amp; Question &mdash; No 'to'):</strong><br>
            You <em>need not go</em> there. (need not के बाद 'to' नहीं लगता!)<br>
            <em>Need I tell</em> you again?
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; <strong>Main Verb रूप (Takes 'to + V1' &amp; 's/es/ed'):</strong><br>
            He <em>needs to buy</em> a car. / She <em>does not need to go</em>.
          </div>
        </div>
      </div>

      <!-- Dare: Modal vs Main Verb -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase block mb-2">Dare: Modal vs. Main Verb</span>
        <div class="space-y-2 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; <strong>Modal रूप (No 'to'):</strong><br>
            He <em>dare not touch</em> it. / <em>Dare you enter</em> the room?<br>
            (dare not के बाद 'to touch' लिखना गलत है)
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            &bull; <strong>Main Verb रूप (Takes 'to + V1'):</strong><br>
            He <em>dares to challenge</em> me. / He <em>did not dare to say</em> a word.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 6: Top SSC Exam Traps -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">6</span>
        SSC के 5 सर्वाधिक पूछे जाने वाले Modals Traps
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Tier-1 और Tier-2 में इन 5 नियमों से बार-बार सीधे Error पूछे जाते हैं:
      </p>
    </div>

    <div class="space-y-3">
      <!-- Trap 1: Lest + Should -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">
          Trap 1: Lest के साथ हमेशा 'Should' आता है, और कोई 'Not' नहीं लगता!
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          'Lest' का अर्थ होता है <em>"कहीं ऐसा न हो कि"</em> (पहले से ही नकारात्मक है)। इसके साथ कभी <em>will, would, may, might</em> या <em>not</em> नहीं आता &mdash; केवल <strong>should</strong> आता है:<br>
          &bull; <em>Incorrect:</em> Walk carefully lest you <strong>will fall</strong>.<br>
          &bull; <em>Correct:</em> Walk carefully lest you <strong>should fall</strong>.
        </p>
      </div>

      <!-- Trap 2: Would rather ... than -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">
          Trap 2: Would rather के साथ 'Than' आता है (to या then नहीं) + Bare Infinitive
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          पसंद (Preference) बताने के लिए <code>would rather + V1 + than + V1</code> का प्रयोग होता है:<br>
          &bull; <em>Incorrect:</em> I would rather starve <strong>then</strong> beg.<br>
          &bull; <em>Correct:</em> I would rather starve <strong>than</strong> beg.
        </p>
      </div>

      <!-- Trap 3: Need not / Dare not + To + V1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1">
          Trap 3: Need not और Dare not के बाद 'To' नहीं आता!
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          जब need और dare नकारात्मक Modal बनते हैं, तो इनके बाद Bare Infinitive आता है:<br>
          &bull; <em>Incorrect:</em> You need not <strong>to worry</strong>.<br>
          &bull; <em>Correct:</em> You need not <strong>worry</strong>.
        </p>
      </div>
    </div>
  </div>

  <!-- Section 7: Solved SSC Exam PYQs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">7</span>
        SSC Previous Year Questions (PYQs with Explanations)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC CGL, CHSL एवं CPO में बार-बार पूछे गए Modals प्रश्न:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">Lest + Should Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> Make haste lest you __________ miss the train.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) will</p>
          <p>(B) should</p>
          <p>(C) might</p>
          <p>(D) could</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-rose-500">
          <span class="font-bold text-rose-700 dark:text-rose-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> कंजंक्शन 'Lest' के बाद हमेशा केवल <strong>should</strong> का ही प्रयोग होता है (will या might गलत हैं)।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">Used to Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> He is used to __________ late at night.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) work</p>
          <p>(B) working</p>
          <p>(C) worked</p>
          <p>(D) have worked</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-indigo-500">
          <span class="font-bold text-indigo-700 dark:text-indigo-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> जब 'used to' के पहले 'be' क्रिया (is/am/are/was/were) आती है, तो यह Adjective (आदी होना) बन जाता है और इसके बाद <strong>V1+ing (working)</strong> आता है।
        </div>
      </div>

      <!-- PYQ 3 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CPO</span>
          <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">Need Not Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q3:</strong> You need not __________ any further explanation.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) to give</p>
          <p>(B) give</p>
          <p>(C) giving</p>
          <p>(D) gave</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-amber-500">
          <span class="font-bold text-amber-700 dark:text-amber-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'Need not' एक Modal Auxiliary है, जिसके बाद बिना 'to' के <strong>Bare Infinitive (give)</strong> आता है।
        </div>
      </div>

      <!-- PYQ 4 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-2</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">Perfect Modal</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q4:</strong> He __________ the exam easily, but he did not study at all.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) can pass</p>
          <p>(B) could have passed</p>
          <p>(C) must pass</p>
          <p>(D) should pass</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-emerald-500">
          <span class="font-bold text-emerald-700 dark:text-emerald-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> भूतकाल में क्षमता थी लेकिन कार्य नहीं हुआ &mdash; इसके लिए <strong>could have + V3 (could have passed)</strong> का प्रयोग होता है।
        </div>
      </div>
    </div>
  </div>

  <!-- Section 8: FAQs -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (Modals FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. क्या Modals में कभी 's' या 'ed' लग सकता है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          नहीं, कभी नहीं। Modals (can, may, must, should आदि) पर Subject के Singular/Plural या Person का कोई प्रभाव नहीं पड़ता। वे सदा अपने मूल रूप में रहते हैं।
        </p>
      </details>

      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q2. 'Should have' और 'Must have' में क्या अंतर है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <em>Should have + V3</em> का प्रयोग तब होता है जब कोई काम भूतकाल में <strong>होना चाहिए था लेकिन नहीं हुआ</strong> (जैसे 'You should have helped him')। 
          जबकि <em>Must have + V3</em> का प्रयोग भूतकाल में किसी काम के <strong>अवश्य घटित होने के पक्के अनुमान</strong> के लिए होता है (जैसे 'He must have reached home')।
        </p>
      </details>
    </div>
  </div>

</div>
"""

def main():
    print("Modals HTML length:", len(modals_html), "chars")
    out_path = "scripts/scratch/modals_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(modals_html)
    print("Saved to", out_path)

if __name__ == "__main__":
    main()
