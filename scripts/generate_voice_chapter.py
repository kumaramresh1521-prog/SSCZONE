# -*- coding: utf-8 -*-
"""
Script to generate the comprehensive, clean, bilingual HTML for Active and Passive Voice.
Follows all SSCZone standard components: Intro card, Formula box, Rules breakdown,
Clean tables, Callout alerts, PYQs, and FAQs.
"""

import os
import json

voice_html = """
<div class="space-y-10">

  <!-- Chapter Hero / Summary Card -->
  <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <span class="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">
        Chapter 05 &bull; SSC English Master Notes
      </span>
      <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
        Target: SSC CGL &bull; CHSL &bull; CPO &bull; MTS &bull; Stenographer 2026
      </span>
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Active & Passive Voice (वाच्य) &bull; Complete SSC Rules, Transformation Charts & Special Traps
    </h1>
    <p class="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
      Active एवं Passive Voice SSC CGL Tier-1 और विशेष रूप से Tier-2 / CPO Mains में सबसे अधिक अंक दिलाने वाला अध्याय है। 
      इसमें नियम एकदम गणितीय (Formula-based) होते हैं। यदि आप <strong>‘To Be’ का सही रूप + $V_3$</strong> तथा <strong>Preposition व Tense परिवर्तन के नियमों</strong> को समझ लेते हैं, 
      तो Voice का 1 भी प्रश्न गलत नहीं हो सकता। इस अध्याय में सभी 8 परिवर्तनीय Tenses, Modals, Imperative वाक्य, Bare Infinitive और Preposition Traps का सम्पूर्ण संकलन है।
    </p>

    <!-- Key Takeaway Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-indigo-600 dark:text-indigo-400">8 / 12</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Tenses में Passive संभव</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-blue-600 dark:text-blue-400">100%</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Passive में सदा $V_3$ (Past Participle)</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-emerald-600 dark:text-emerald-400">Fixed Prep</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Known to, Surprised at...</span>
      </div>
      <div class="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-xs">
        <span class="block text-2xl font-black text-amber-600 dark:text-amber-400">SSC Weightage</span>
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Tier-1: 1-2 Qs | Tier-2: 3-5 Qs</span>
      </div>
    </div>
  </div>

  <!-- Section 1: Concept & Transitive vs Intransitive Verbs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
        Voice क्या है? &bull; Active vs Passive Voice की पहचान
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        क्रिया (Verb) का वह रूप जो यह व्यक्त करता है कि कर्ता (Subject) स्वयं कोई कार्य कर रहा है, या कर्ता पर ही कार्य का प्रभाव पड़ रहा है।
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="inline-block px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-xs rounded mb-2">Active Voice (कर्तृवाच्य)</div>
        <p class="text-sm text-slate-700 dark:text-slate-300 mb-3">
          जब वाक्य का आरम्भ <strong>कर्ता (Subject / Doer)</strong> से होता है, अर्थात् कर्ता कार्य को करता है।
        </p>
        <ul class="text-xs space-y-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
          <li>&bull; <strong class="text-slate-900 dark:text-white">They</strong> will do the work. (वे काम करेंगे &mdash; Doer 'They' पहले है)</li>
          <li>&bull; <strong class="text-slate-900 dark:text-white">The teacher</strong> has punished the boy. (अध्यापक ने लड़के को दंडित किया)</li>
        </ul>
      </div>

      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-xs rounded mb-2">Passive Voice (कर्मवाच्य)</div>
        <p class="text-sm text-slate-700 dark:text-slate-300 mb-3">
          जब वाक्य का आरम्भ <strong>कर्म (Object / Receiver)</strong> से होता है, अर्थात् कार्य कर्म पर किया जाता है।
        </p>
        <ul class="text-xs space-y-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
          <li>&bull; <strong class="text-slate-900 dark:text-white">The work</strong> will be done by them. (काम उनके द्वारा किया जाएगा)</li>
          <li>&bull; <strong class="text-slate-900 dark:text-white">The boy</strong> has been punished by the teacher. (लड़का दंडित किया गया)</li>
        </ul>
      </div>
    </div>

    <!-- Golden Condition: Transitive vs Intransitive Verbs -->
    <div class="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
      <h3 class="text-base font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
        <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        Passive Voice की अनिवार्य शर्त: सिर्फ सकर्मक क्रिया (Transitive Verb) का ही Passive बनता है!
      </h3>
      <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
        जब क्रिया का फल किसी <strong>Object (कर्म)</strong> पर पड़ता है, तभी वह Transitive होती है। यदि वाक्य में Object ही नहीं है (Intransitive Verb), तो Passive Voice <strong>नहीं बन सकता</strong>।
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p class="font-bold text-emerald-700 dark:text-emerald-400 mb-1">Transitive Verbs (Passive संभव):</p>
          <p class="text-slate-600 dark:text-slate-400">He writes a letter. &rarr; यहाँ <em>writes</em> का सीधा असर <em>a letter</em> पर है। अतः Passive: <em>A letter is written by him.</em></p>
        </div>
        <div class="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p class="font-bold text-rose-700 dark:text-rose-400 mb-1">Intransitive Verbs (Passive असंभव):</p>
          <p class="text-slate-600 dark:text-slate-400">Jaya came here. / Father is going out. &rarr; <em>come, go, sleep, die, arrive</em> अकर्मक क्रियाएँ हैं। इनके बाद कोई Object नहीं होता (here/out Adverbs हैं)। अतः इनका Passive नहीं बनता।</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 2: Master Transformation Formula -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">2</span>
        Passive Voice का सार्वभौमिक सूत्र (Master Transformation Formula)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        अंग्रेजी व्याकरण में किसी भी Active वाक्य को Passive में बदलते समय 3 बुनियादी बदलाव होते हैं:
      </p>
    </div>

    <!-- Interactive Formula Box -->
    <div class="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
      <div class="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-2">Master Rule of Passive Voice</div>
      <div class="text-lg md:text-xl font-mono text-emerald-400 mb-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        Active: &nbsp; Subject + Verb + Object<br>
        Passive: Object + Helping Verb (Form of 'To Be') + V3 (Past Participle) + by + Subject
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <span class="font-bold text-indigo-300 block mb-1">नियम 1: अदला-बदली</span>
          Active का Object &rarr; Passive का Subject बनता है। Active का Subject &rarr; 'by' के बाद Objective Case (me, him, her, them, us) में आता है।
        </div>
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <span class="font-bold text-indigo-300 block mb-1">नियम 2: सदा V3 रूप</span>
          Passive Voice में मुख्य क्रिया (Main Verb) सदा अपनी <strong>तीसरी अवस्था (V3 - Past Participle)</strong> में ही रहती है।
        </div>
        <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <span class="font-bold text-indigo-300 block mb-1">नियम 3: 'To Be' का चुनाव</span>
          Tense का निर्धारण सिर्फ 'To Be' के रूप से होता है: <em>be, is/am/are, was/were, being, been</em>।
        </div>
      </div>
    </div>

    <!-- Forms of 'TO BE' Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr class="bg-indigo-50 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-slate-700">
            <th class="p-3 font-bold">Form of 'TO BE'</th>
            <th class="p-3 font-bold">Tense / Verb Construction</th>
            <th class="p-3 font-bold">Passive Verb Structure</th>
            <th class="p-3 font-bold">उदाहरण</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">be</td>
            <td class="p-3">Infinitive, Modals, Future Indefinite</td>
            <td class="p-3 font-mono text-xs">will/can/must + be + V3</td>
            <td class="p-3">It can <strong>be done</strong>.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">is, am, are</td>
            <td class="p-3">Present Indefinite (Simple Present)</td>
            <td class="p-3 font-mono text-xs">is/am/are + V3</td>
            <td class="p-3">A song <strong>is sung</strong>.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">was, were</td>
            <td class="p-3">Past Indefinite (Simple Past)</td>
            <td class="p-3 font-mono text-xs">was/were + V3</td>
            <td class="p-3">The letter <strong>was written</strong>.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">been</td>
            <td class="p-3">Perfect Tenses (Present, Past, Future)</td>
            <td class="p-3 font-mono text-xs">has/have/had/will have + been + V3</td>
            <td class="p-3">He has <strong>been punished</strong>.</td>
          </tr>
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">being</td>
            <td class="p-3">Continuous Tenses (Present & Past)</td>
            <td class="p-3 font-mono text-xs">is/am/are/was/were + being + V3</td>
            <td class="p-3">A car is <strong>being driven</strong>.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Section 3: Tense-by-Tense Master Table -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">3</span>
        Tense-wise Active to Passive Transformation Chart (सभी 8 काल)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        कुल 12 Tenses में से सिर्फ 8 Tenses का Passive Voice बनता है। 4 Tenses (Future Continuous और तीनों Perfect Continuous) का Passive Voice सामान्यतः नहीं बनाया जाता।
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
            <th class="p-3 font-bold">Tense</th>
            <th class="p-3 font-bold">Active Voice Structure</th>
            <th class="p-3 font-bold">Passive Voice Structure</th>
            <th class="p-3 font-bold">Active Example</th>
            <th class="p-3 font-bold">Passive Transformation</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
          <!-- 1. Simple Present -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Simple Present</td>
            <td class="p-3 font-mono text-xs">S + V1 / V1+s/es + O</td>
            <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">O + is/am/are + V3 + by S</td>
            <td class="p-3">She writes letters.</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">Letters <strong>are written</strong> by her.</td>
          </tr>
          <!-- 2. Present Continuous -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Present Cont.</td>
            <td class="p-3 font-mono text-xs">S + is/am/are + V1+ing + O</td>
            <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">O + is/am/are + being + V3 + by S</td>
            <td class="p-3">They are playing football.</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">Football <strong>is being played</strong> by them.</td>
          </tr>
          <!-- 3. Present Perfect -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Present Perfect</td>
            <td class="p-3 font-mono text-xs">S + has/have + V3 + O</td>
            <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">O + has/have + been + V3 + by S</td>
            <td class="p-3">The teacher has punished him.</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">He <strong>has been punished</strong> by the teacher.</td>
          </tr>
          <!-- 4. Simple Past -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Simple Past</td>
            <td class="p-3 font-mono text-xs">S + V2 + O</td>
            <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">O + was/were + V3 + by S</td>
            <td class="p-3">He killed the snake.</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">The snake <strong>was killed</strong> by him.</td>
          </tr>
          <!-- 5. Past Continuous -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Past Cont.</td>
            <td class="p-3 font-mono text-xs">S + was/were + V1+ing + O</td>
            <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">O + was/were + being + V3 + by S</td>
            <td class="p-3">She was driving a car.</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">A car <strong>was being driven</strong> by her.</td>
          </tr>
          <!-- 6. Past Perfect -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Past Perfect</td>
            <td class="p-3 font-mono text-xs">S + had + V3 + O</td>
            <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">O + had + been + V3 + by S</td>
            <td class="p-3">They had completed the task.</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">The task <strong>had been completed</strong> by them.</td>
          </tr>
          <!-- 7. Simple Future -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Simple Future</td>
            <td class="p-3 font-mono text-xs">S + will/shall + V1 + O</td>
            <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">O + will/shall + be + V3 + by S</td>
            <td class="p-3">They will do the work.</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">The work <strong>will be done</strong> by them.</td>
          </tr>
          <!-- 8. Future Perfect -->
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">Future Perfect</td>
            <td class="p-3 font-mono text-xs">S + will/shall have + V3 + O</td>
            <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">O + will/shall have been + V3 + by S</td>
            <td class="p-3">He will have won the race.</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">The race <strong>will have been won</strong> by him.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Red Alert: 4 Tenses with NO Passive -->
    <div class="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
      <div class="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 text-sm mb-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
        इन 4 Tenses का Passive Voice परीक्षा में नहीं बनता:
      </div>
      <p class="text-xs text-rose-700 dark:text-rose-400">
        1. Present Perfect Continuous &nbsp;|&nbsp; 2. Past Perfect Continuous &nbsp;|&nbsp; 3. Future Perfect Continuous &nbsp;|&nbsp; 4. Future Continuous.<br>
        (कारण: इनमें 'been being' या 'be being' जैसी ध्वनियाँ व्याकरणिक रूप से भद्दी व अनावश्यक मानी जाती हैं)।
      </p>
    </div>
  </div>

  <!-- Section 4: Modals, Infinitives & Gerunds -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">4</span>
        Modals, Infinitives एवं Gerunds का Passive Voice
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC परीक्षाओं में सामान्य Tense के स्थान पर Modals और Infinitives से प्रश्न सबसे अधिक पूछे जाते हैं।
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 1. Modals -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">A. Modal Auxiliaries</h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">
          Formula: <code class="text-indigo-700 dark:text-indigo-300 font-bold">Modal + be + V3</code>
        </p>
        <div class="space-y-2 text-xs">
          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <strong>Active:</strong> We can win this match.<br>
            <strong>Passive:</strong> This match <em>can be won</em> by us.
          </div>
          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <strong>Active:</strong> You must obey traffic rules.<br>
            <strong>Passive:</strong> Traffic rules <em>must be obeyed</em>.
          </div>
          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <strong>Active:</strong> The judge should punish criminals.<br>
            <strong>Passive:</strong> Criminals <em>should be punished</em>.
          </div>
        </div>
      </div>

      <!-- 2. Infinitives (to + V1) -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">B. Infinitives (To + V1)</h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">
          Formula: <code class="text-blue-700 dark:text-blue-300 font-bold">to be + V3</code>
        </p>
        <div class="space-y-2 text-xs">
          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <strong>Active:</strong> She is to write a letter.<br>
            <strong>Passive:</strong> A letter <em>is to be written</em> by her.
          </div>
          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <strong>Active:</strong> They were to complete the work.<br>
            <strong>Passive:</strong> The work <em>was to be completed</em>.
          </div>
          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <strong>Active:</strong> There is nothing to lose.<br>
            <strong>Passive:</strong> There is nothing <em>to be lost</em>.
          </div>
        </div>
      </div>

      <!-- 3. Gerunds / V1+ing -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">C. Gerund / Participle (V1+ing)</h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">
          Formula: <code class="text-emerald-700 dark:text-emerald-300 font-bold">being + V3</code>
        </p>
        <div class="space-y-2 text-xs">
          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <strong>Active:</strong> I remember my mother taking me to doctor.<br>
            <strong>Passive:</strong> I remember <em>being taken</em> to doctor by my mother.
          </div>
          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded">
            <strong>Active:</strong> I found his friends laughing at him.<br>
            <strong>Passive:</strong> I found him <em>being laughed at</em> by his friends.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 5: Imperative Sentences Master Rules -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">5</span>
        Imperative Sentences (आज्ञा, अनुरोध, सलाह) के नियम
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Imperative वाक्यों में कर्ता 'You' छिपा रहता है। भाव (Sense) के अनुसार इनके अलग-अलग सूत्र होते हैं:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 1. Order / Command with Object -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">1. Command / Order (With Object)</span>
          <span class="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded font-mono">Let + Object + be + V3</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">यदि वाक्य में कर्म (Object) मौजूद हो, तो वाक्य 'Let' से शुरू होता है:</p>
        <ul class="text-xs space-y-1 text-slate-700 dark:text-slate-300">
          <li>&bull; Bring a book. &rarr; <strong>Let a book be brought.</strong></li>
          <li>&bull; Turn Payal out. &rarr; <strong>Let Payal be turned out.</strong></li>
          <li>&bull; Close the door. &rarr; <strong>Let the door be closed.</strong></li>
        </ul>
      </div>

      <!-- 2. Order without Object -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">2. Command / Order (Without Object)</span>
          <span class="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-mono">You are ordered to + V1</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">यदि अकर्मक क्रिया हो (कोई Object न हो), तो 'You are ordered to' का प्रयोग करें:</p>
        <ul class="text-xs space-y-1 text-slate-700 dark:text-slate-300">
          <li>&bull; Go out at once. &rarr; <strong>You are ordered to go out at once.</strong></li>
          <li>&bull; Don't stay here. &rarr; <strong>You are ordered not to stay here.</strong></li>
        </ul>
      </div>

      <!-- 3. Moral Advice / Suggestion -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">3. Advice / Moral Duty (सलाह / कर्तव्य)</span>
          <span class="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono">Object + should be + V3</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">सलाह या कर्तव्य के भाव में 'Let' के स्थान पर 'should be' श्रेष्ठ माना जाता है:</p>
        <ul class="text-xs space-y-1 text-slate-700 dark:text-slate-300">
          <li>&bull; Obey parents. &rarr; <strong>Parents should be obeyed.</strong></li>
          <li>&bull; Help the poor. &rarr; <strong>The poor should be helped.</strong></li>
          <li>&bull; Listen to me. &rarr; <strong>I should be listened to.</strong></li>
          <li>&bull; Prepare for war. &rarr; <strong>You should be prepared for war.</strong></li>
        </ul>
      </div>

      <!-- 4. Request & Let us -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">4. Request &amp; 'Let Us' (सुझाव)</span>
          <span class="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded font-mono">You are requested / It is suggested</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">'Please / Kindly' हटने पर 'You are requested to' लगता है:</p>
        <ul class="text-xs space-y-1 text-slate-700 dark:text-slate-300">
          <li>&bull; Please come soon. &rarr; <strong>You are requested to come soon.</strong></li>
          <li>&bull; Let me play here. &rarr; <strong>I may be allowed to play here.</strong></li>
          <li>&bull; Let us stay here. &rarr; <strong>It is suggested that we should stay here.</strong></li>
          <li>&bull; Let us sleep here. &rarr; <strong>It is suggested that we should sleep here.</strong></li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Section 6: Special SSC Exam Traps & Exceptions -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">6</span>
        SSC के 7 सबसे घातक Traps (विशेष अपवाद एवं नियम)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Tier-1 और Tier-2 में 80% गलतियाँ इन्हीं 7 बिंदुओं पर होती हैं:
      </p>
    </div>

    <div class="space-y-4">
      <!-- Trap 1: Verbs with Fixed Prepositions (NOT 'By') -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          Trap 1: 'By' के स्थान पर अन्य Prepositions लेने वाली क्रियाएँ (Fixed Prepositions)
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          कुछ क्रियाएँ Passive Voice में कर्ता के पहले <code>by</code> नहीं लेतीं, बल्कि अपना निश्चित Preposition लेती हैं:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Surprise / Shock &rarr; AT</span>
            Active: Her sudden arrival surprised everyone.<br>
            Passive: Everybody was <strong>surprised at</strong> her sudden arrival. (not by)
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Know / Marry &rarr; TO</span>
            Active: I know him.<br>
            Passive: He is <strong>known to</strong> me. (not by me)
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Pleased / Satisfied &rarr; WITH</span>
            Active: His work pleased the boss.<br>
            Passive: The boss was <strong>pleased with</strong> his work.
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Contain / Embody &rarr; IN</span>
            Active: This box contains ten books.<br>
            Passive: Ten books are <strong>contained in</strong> this box.
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Annoy (Person) &rarr; WITH</span>
            Active: Ram annoyed Shyam.<br>
            Passive: Shyam was <strong>annoyed with</strong> Ram.
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Annoy (Action) &rarr; AT</span>
            Active: His behaviour annoyed us.<br>
            Passive: We were <strong>annoyed at</strong> his behaviour.
          </div>
        </div>
      </div>

      <!-- Trap 2: Bare Infinitives (make, hear, see, bid) -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Trap 2: Bare Infinitives &rarr; Passive में 'To + V1' बन जाते हैं!
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          <em>make, hear, see, bid, watch</em> के बाद Active Voice में बिना 'to' के $V_1$ (Bare Infinitive) आता है, लेकिन <strong>Passive Voice में अनिवार्य रूप से 'to' जुड़ जाता है</strong>।
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Make:</p>
            Active: I made her sing a song.<br>
            Passive: She was made <strong>to sing</strong> a song.
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Bid:</p>
            Active: I bade him go.<br>
            Passive: He was bidden <strong>to go</strong>.
          </div>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">अपवाद (LET):</p>
            'Let' के साथ Passive में भी 'to' नहीं लगता!<br>
            Active: She let me go.<br>
            Passive: I was let go by her. (not let to go)
          </div>
        </div>
      </div>

      <!-- Trap 3: Phrasal Verbs Preposition Retention -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          Trap 3: Phrasal Verbs का Preposition कभी न छोड़ें!
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">
          जब क्रिया के साथ Preposition जुड़ा हो (जैसे <em>look after, laugh at, look down upon</em>), तो Passive में 'by' आने के बाद भी क्रिया का Preposition <strong>कायम रहता है</strong>:
        </p>
        <div class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <p>&bull; Active: Mothers look after their children. &rarr; Passive: Children are <strong>looked after by</strong> their mothers.</p>
          <p>&bull; Active: You should not look down upon the poor. &rarr; Passive: The poor should not be <strong>looked down upon by</strong> you.</p>
        </div>
      </div>

      <!-- Trap 4: Omission of Vague Agent & Nobody/None -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Trap 4: अस्पष्ट कर्ता (Vague Agent) का लोप एवं Nobody/None का प्रयोग
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-2">
          (a) यदि कर्ता <em>somebody, someone, people, they, police</em> जैसा सामान्य या स्वतः स्पष्ट हो, तो Passive में <code>by somebody</code> हटा दिया जाता है:<br>
          &bull; Active: Somebody has picked my pocket. &rarr; Passive: <strong>My pocket has been picked.</strong> (not by somebody)<br>
          &bull; Active: They will declare the result soon. &rarr; Passive: <strong>The result will be declared soon.</strong>
        </p>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          (b) यदि Active वाक्य <em>Nobody / None</em> से शुरू हो, तो Passive में <strong>not</strong> लग जाता है:<br>
          &bull; Active: Nobody can change destiny. &rarr; Passive: <strong>Destiny cannot be changed.</strong><br>
          &bull; Active: None saw her in the parlour. &rarr; Passive: <strong>She was not seen in the parlour.</strong>
        </p>
      </div>

      <!-- Trap 5: Sentences with That-Clause & Two Objects -->
      <div class="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          Trap 5: That-Clause तथा दो कर्मों (Two Objects) वाले वाक्य
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">That-Clause (It is + V3 + that...):</span>
            Active: People consider that he is honest.<br>
            Passive: <strong>It is considered that he is honest.</strong><br><br>
            Active: We hope that he will pass.<br>
            Passive: <strong>It is hoped that he will pass.</strong>
          </div>
          <div>
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">दो कर्म (Indirect & Direct Objects):</span>
            Active: He gave me a book.<br>
            Passive (a): <strong>I was given a book by him.</strong> (सजीव कर्म से बनाना अधिक स्वाभाविक है)<br>
            Passive (b): <strong>A book was given to me by him.</strong>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 7: Solved SSC Exam PYQs -->
  <div class="space-y-6">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">7</span>
        SSC पिछले वर्षों के हल प्रश्न (PYQs with Step-by-Step Traps)
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        SSC CGL, CHSL एवं CPO में बार-बार पूछे गए वास्तविक प्रश्नों का सटीक विश्लेषण:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- PYQ 1 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-1</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">Fixed Preposition Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q1:</strong> Her sudden arrival surprised everyone. Change into Passive Voice.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) Everyone was surprised by her sudden arrival.</p>
          <p>(B) Everyone was surprised at her sudden arrival.</p>
          <p>(C) Everyone had surprised at her sudden arrival.</p>
          <p>(D) Everyone was surprising her sudden arrival.</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-emerald-500">
          <span class="font-bold text-emerald-700 dark:text-emerald-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> 'Surprised' किसी घटना या आगमन पर होने पर Preposition <strong>'at'</strong> लेता है, न कि 'by'। अतः <em>surprised at</em> सही है।
        </div>
      </div>

      <!-- PYQ 2 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CGL Tier-2</span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">Bare Infinitive Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q2:</strong> The teacher made him clean the blackboard.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) He was made clean the blackboard by the teacher.</p>
          <p>(B) He was made to clean the blackboard by the teacher.</p>
          <p>(C) He had been made cleaning the blackboard.</p>
          <p>(D) He was made being cleaned the blackboard.</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-indigo-500">
          <span class="font-bold text-indigo-700 dark:text-indigo-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> Verb 'make' के बाद Active में Bare Infinitive (clean) आता है, लेकिन Passive Voice में अनिवार्य रूप से <strong>'to + V1' (to clean)</strong> आता है।
        </div>
      </div>

      <!-- PYQ 3 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CHSL</span>
          <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">Imperative Advice Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q3:</strong> Obey your parents.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) Let your parents be obeyed.</p>
          <p>(B) Your parents should be obeyed.</p>
          <p>(C) You are ordered to obey parents.</p>
          <p>(D) Parents must obey you.</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-amber-500">
          <span class="font-bold text-amber-700 dark:text-amber-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> जब वाक्य में नैतिक कर्तव्य या सलाह (Moral Duty) का भाव हो, तो 'Let' के स्थान पर <strong>'should be + V3'</strong> का प्रयोग सर्वाधिक उपयुक्त माना जाता है।
        </div>
      </div>

      <!-- PYQ 4 -->
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SSC CPO</span>
          <span class="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">Phrasal Verb Trap</span>
        </div>
        <p class="text-sm font-medium text-slate-900 dark:text-white mb-2">
          <strong>Q4:</strong> They are looking after the orphans.
        </p>
        <div class="text-xs space-y-1 text-slate-600 dark:text-slate-400 mb-3">
          <p>(A) The orphans are looked after by them.</p>
          <p>(B) The orphans are being looked after by them.</p>
          <p>(C) The orphans have been looked after.</p>
          <p>(D) The orphans are being looked by them.</p>
        </div>
        <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs border-l-2 border-purple-500">
          <span class="font-bold text-purple-700 dark:text-purple-400">उत्तर: (B)</span> &bull; <em>Explanation:</em> Present Continuous होने के कारण <em>'are being looked'</em> आएगा और Phrasal verb का Preposition <strong>'after'</strong> अनिवार्य रूप से लगा रहेगा (looked after by them)।
        </div>
      </div>
    </div>
  </div>

  <!-- Section 8: Frequently Asked Questions (FAQ) -->
  <div class="space-y-4">
    <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">अक्सर पूछे जाने वाले सवाल (Voice FAQs)</h2>
    </div>

    <div class="space-y-3">
      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q1. क्या सभी वाक्यों का Passive Voice बनाया जा सकता है?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          नहीं। केवल सकर्मक क्रियाओं (Transitive Verbs &mdash; जिनके साथ Object हो) का ही Passive बनता है। अकर्मक क्रियाओं (Intransitive Verbs जैसे <em>go, come, sleep, die</em>) का कोई Object न होने के कारण Passive Voice नहीं बनता।
        </p>
      </details>

      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q2. Active Voice से Passive Voice बनाते समय Tense बदलता है या नहीं?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>बिल्कुल नहीं!</strong> यह Voice और Narration (Direct-Indirect) का सबसे बड़ा अंतर है। Narration में Present Past में बदल जाता है, लेकिन Voice में Tense <strong>समान रहता है</strong> (Present Indefinite का उत्तर Present में ही रहेगा, सिर्फ 'is/am/are + V3' लग जाता है)।
        </p>
      </details>

      <details class="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <summary class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
          <span>Q3. 'by + subject' कब छोड़ दिया जाता है (Omit)?</span>
          <span class="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
        </summary>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          जब कर्ता अस्पष्ट (vague) हो या कार्य करने वाले का उल्लेख करना अनावश्यक हो &mdash; जैसे <em>someone, somebody, anyone, people, they, the police</em>। उदाहरण के लिए: <em>The thief was caught (by the police छोड़ दिया जाता है)।</em>
        </p>
      </details>
    </div>
  </div>

</div>
"""

def main():
    print("Voice HTML length:", len(voice_html), "chars")
    out_path = "scripts/scratch/voice_ssczone_formatted.html"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(voice_html)
    print("Saved to", out_path)

if __name__ == "__main__":
    main()
