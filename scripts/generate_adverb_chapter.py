# -*- coding: utf-8 -*-
"""
Generates Chapter: English Adverb (क्रिया विशेषण) - Master Study Notes
100% Comprehensive Coverage from adverb_ssczone.pdf
Includes:
- What is an Adverb? (Definition & Purpose)
- 8 Kinds of Adverbs (Time, Frequency, Place, Manner, Affirmation/Negation, Degree, Interrogative, Relative)
- Rules of Adverbs (Rule I to XIII)
  - Rule I: Adjective vs Adverb
  - Rule II: Position of Adverbs of Time / Frequency (before main verb)
  - Rule III: Position of Adverbs of Manner (after intransitive, before/after transitive)
  - Rule IV: The Law of Inversion (Seldom, Never, Hardly, Scarcely, No sooner + Aux + Sub + Main Verb)
  - Rule V: Else... but vs Other... than
  - Rule VI: Never vs Not (Point of time vs habitual)
  - Rule VII: Fixed Correlative Phrases (seldom or never, seldom if ever, little or nothing)
  - Rule VIII: Avoiding Double Negatives (Hardly, Scarcely, Deny, Forbid, Lest, Until, Unless)
  - Rule IX: Words confused between Adjective & Adverb (Cowardly, Miserly, Manly, Fast, Late/Lately, Hard/Hardly)
  - Rule X: Usage of Very, Much, So, Too, Enough (wise enough), Rather
  - Rule XI: Too, As well, Also & Echo tags (So did I / Neither did I)
  - Rule XII: Answering with Yes / No
  - Rule XIII: Verbs that take 'as' vs Verbs that DROP 'as' (considered as ❌, appointed as ❌)
- Solved Shift Questions with bilingual explanations
- FAQs
"""

def build_adverb_content():
    html = []

    # 1. Intro Card
    html.append("""<div class="note-intro-card">
  <h3>🎯 Chapter Overview / अध्याय सारांश</h3>
  <p><span class="lang-en">An <strong>Adverb</strong> is a modifier that adds information to a verb, an adjective, or another adverb. In SSC examinations (CGL, CHSL, CPO, MTS), Adverb questions center heavily on <strong>The Law of Inversion</strong> (Hardly/Scarcely/No sooner), <strong>Confusing Adjective-Adverb pairs</strong> (fast vs fastly, cowardly vs in a cowardly manner), <strong>Placement of 'Enough'</strong>, and <strong>Verbs that drop 'as'</strong> (consider, appoint, elect). These 13 rules provide 100% preparation for SSC grammar shifts.</span>
  <span class="lang-hi"><strong>क्रिया विशेषण (Adverb)</strong> वह शब्द है जो किसी क्रिया (Verb), विशेषण (Adjective) या दूसरे क्रिया विशेषण (Adverb) की विशेषता बताता है या उसके अर्थ को संशोधित करता है। SSC की परीक्षाओं में Adverb से जुड़े प्रश्न मुख्य रूप से <strong>इनवर्जन के नियम (Law of Inversion)</strong>, <strong>भ्रमित करने वाले शब्द (fastly कोई शब्द नहीं होता, cowardly विशेषण है)</strong>, <strong>'Enough' का सही स्थान</strong>, और <strong>जिन क्रियाओं के बाद 'as' नहीं लगता (consider, appoint, call)</strong> पर आधारित होते हैं।</span></p>
</div>""")

    # 2. What is an Adverb? Definition
    html.append("""<h2><span class="lang-en">1. What is an Adverb? (Definition & Function)</span><span class="lang-hi">1. क्रिया विशेषण (Adverb) क्या है? (परिभाषा एवं कार्य)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>An <strong>Adverb</strong> is a word used to modify or qualify the meaning of:</p>
    <ul>
      <li><strong>A Verb:</strong> She is walking <strong>slowly</strong>. (Modifies verb 'walking' - How?)</li>
      <li><strong>An Adjective:</strong> She is <strong>very</strong> intelligent. (Modifies adjective 'intelligent' - How much?)</li>
      <li><strong>Another Adverb:</strong> She is walking <strong>very slowly</strong>. (Modifies adverb 'slowly' - To what degree?)</li>
    </ul>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p>हिंदी व्याकरण में <strong>क्रिया विशेषण (Adverb)</strong> वह शब्द है जो किसी <em>क्रिया (Verb)</em>, <em>विशेषण (Adjective)</em> या <em>अन्य क्रिया विशेषण</em> के अर्थ को स्पष्ट करता है, विशेषता बताता है या परिमाण तय करता है।</p>
    <ul>
      <li><strong>क्रिया की विशेषता:</strong> She is walking <strong>slowly</strong>. (वह <strong>धीरे-धीरे</strong> चल रही है।)</li>
      <li><strong>विशेषण की विशेषता:</strong> She is <strong>very</strong> intelligent. (वह <strong>बहुत</strong> बुद्धिमान है।)</li>
      <li><strong>अन्य Adverb की विशेषता:</strong> She is walking <strong>very slowly</strong>. (वह <strong>बहुत धीरे-धीरे</strong> चल रही है।)</li>
    </ul>
  </div>
</div>""")

    # 3. Kinds of Adverbs (8 Core Types)
    html.append("""<h2><span class="lang-en">2. Classification: 8 Types of Adverbs</span><span class="lang-hi">2. क्रिया विशेषण के 8 प्रमुख प्रकार</span></h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>Kind (प्रकार)</th>
      <th>Key Adverbs List</th>
      <th>Question Answered & Meaning</th>
      <th>Example Sentence</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Adverb of Time</strong></td>
      <td><code>before, ago, lately, yet, now, soon, yesterday, already, never, today</code></td>
      <td><strong>कब? (When?)</strong> — समय का बोध कराता है।</td>
      <td>He will arrive <strong>soon</strong>. (वह जल्द आएगा।)</td>
    </tr>
    <tr>
      <td><strong>2. Adverb of Frequency</strong></td>
      <td><code>always, once, seldom, usually, rarely, often, frequently, hardly</code></td>
      <td><strong>कितनी बार? (How often?)</strong> — आवृत्ति का बोध।</td>
      <td>She <strong>always</strong> speaks the truth.</td>
    </tr>
    <tr>
      <td><strong>3. Adverb of Place</strong></td>
      <td><code>here, there, everywhere, down, near, away, backward, upward</code></td>
      <td><strong>कहाँ? (Where?)</strong> — स्थान या दिशा का बोध।</td>
      <td>Please come <strong>here</strong>.</td>
    </tr>
    <tr>
      <td><strong>4. Adverb of Manner</strong></td>
      <td><code>slowly, soundly, delightfully, bravely, easily, foolishly, clearly, well</code></td>
      <td><strong>कैसे? किस ढंग से? (How / In what manner?)</strong></td>
      <td>The soldiers fought <strong>bravely</strong>.</td>
    </tr>
    <tr>
      <td><strong>5. Adverb of Affirmation / Negation</strong></td>
      <td><code>certainly, definitely, obviously, no, not, never, undoubtedly</code></td>
      <td><strong>स्वीकृति या निषेध</strong> (पुष्टि या मनाही)।</td>
      <td>He will <strong>certainly</strong> help you.</td>
    </tr>
    <tr>
      <td><strong>6. Adverb of Degree / Quantity</strong></td>
      <td><code>almost, fully, very, enough, rather, quite, too, really, so, extremely</code></td>
      <td><strong>कितना? किस हद तक? (How much / To what extent?)</strong></td>
      <td>I am <strong>too</strong> tired to walk.</td>
    </tr>
    <tr>
      <td><strong>7. Interrogative Adverb</strong></td>
      <td><code>how, when, where, why</code></td>
      <td><strong>प्रश्न पूछने वाले</strong> Adverbs.</td>
      <td><strong>Where</strong> do you live?</td>
    </tr>
    <tr>
      <td><strong>8. Relative Adverb</strong></td>
      <td><code>when, where, why, how</code></td>
      <td><strong>दो उपवाक्यों को जोड़ने वाले</strong> (Adjective Clause बनाते हैं)।</td>
      <td>This is the house <strong>where</strong> I was born.</td>
    </tr>
  </tbody>
</table>""")

    # 4. Golden Rules of Adverbs (Rule I to XIII)
    html.append("""<h2><span class="lang-en">3. The 13 Golden Rules of Adverbs for SSC Exams</span><span class="lang-hi">3. SSC परीक्षाओं के लिए Adverb के 13 स्वर्णिम नियम</span></h2>""")

    # Rule I & II: Adjective vs Adverb & Position of Time/Frequency
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule I & II: Adjective vs Adverb & Position of Frequency</h3>
  <p><span class="lang-en">1. <strong>Rule I:</strong> An Adjective qualifies a noun/pronoun, whereas an Adverb modifies a verb, adjective, or another adverb.<br/>
  2. <strong>Rule II:</strong> Adverbs of Frequency/Time (<em>always, often, already, just, never, ever, seldom, usually, rarely, hardly, normally</em>) are generally placed <strong>immediately before the main verb</strong> they modify (or after the auxiliary verb 'be').</span>
  <span class="lang-hi">1. Noun की विशेषता बताने के लिए Adjective, और Verb की विशेषता बताने के लिए Adverb आता है।<br/>
  2. <strong>Always, often, never, seldom, usually</strong> आदि शब्द हमेशा <strong>मुख्य क्रिया (Main Verb) से ठीक पहले</strong> या 'be' (is/am/are/was/were) के ठीक बाद आते हैं।</span></p>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 Spotting Error Examples (Rule I & II)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> She ran <strong>quicker</strong> than I.<br/>
    ✓ <em>Correct:</em> She ran <strong>more quickly</strong> than I. [दौड़ने की क्रिया का ढंग → Adverb 'more quickly'!]</p>
    
    <p>❌ <em>Incorrect:</em> My brother comes <strong>often</strong> on Sundays.<br/>
    ✓ <em>Correct:</em> My brother <strong>often comes</strong> on Sundays. ['often' मुख्य क्रिया 'comes' से पहले!]</p>
    
    <p>❌ <em>Incorrect:</em> He goes <strong>usually</strong> to the cinema every Friday.<br/>
    ✓ <em>Correct:</em> He <strong>usually goes</strong> to the cinema every Friday.</p>
    
    <p>✓ <em>Correct:</em> He <strong>never talks</strong> ill of his friends. / He <strong>is always</strong> satisfied.</p>
  </div>
</div>""")

    # Rule III: Manner with Intransitive vs Transitive
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule III: Position of Adverbs of Manner (ढंग बताने वाले Adverb का स्थान)</h3>
  <p><span class="lang-en">• With <strong>Intransitive Verbs (अकर्मक क्रिया - No Object):</strong> The adverb of manner is placed <strong>only after the verb</strong>.<br/>
  • With <strong>Transitive Verbs (सकर्मक क्रिया - With Object):</strong> The adverb can be placed either before the verb or after the object, but <strong>NEVER between the verb and its object</strong>.</span>
  <span class="lang-hi">• अकर्मक क्रिया के बाद ही Adverb आता है (e.g. <em>He slept soundly</em>).<br/>
  • सकर्मक क्रिया में Adverb या तो क्रिया से पहले आएगा या Object के बाद, लेकिन क्रिया और Object के बीच में कभी नहीं आ सकता।</span></p>
</div>

<div class="pyq-box">
  <div class="pyq-title">📝 Exam Examples (Rule III)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> He soundly slept last night.<br/>
    ✓ <em>Correct:</em> He <strong>slept soundly</strong> last night. ['slept' अकर्मक क्रिया है → Adverb बाद में!]</p>
    
    <p>✓ <em>Correct:</em> He <strong>briefly narrated</strong> the incident to me.<br/>
    ✓ <em>Correct:</em> He narrated the incident to me <strong>briefly</strong>.</p>
  </div>
</div>""")

    # Rule IV: The Law of Inversion (Crucial SSC Topic)
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule IV: The Law of Inversion (इनवर्जन का नियम - अत्यधिक महत्वपूर्ण)</h3>
  <p><span class="lang-en">When a sentence begins with a negative or restrictive adverb (<em>Seldom, Never, Hardly, Scarcely, Barely, Rarely, Little, Neither, Nor, No sooner, So quickly</em>), the <strong>Inverted Form of the Verb</strong> must be used for emphasis:</span>
  <span class="lang-hi">जब कोई वाक्य किसी नकारात्मक या प्रतिबंधात्मक Adverb से शुरू होता है, तो वाक्य में <strong>Inversion (सहायक क्रिया + कर्ता + मुख्य क्रिया)</strong> का नियम लागू होता है:</span></p>
</div>

<div class="formula-card">
  <div class="formula-header">⚡ The Inversion Formula</div>
  <div class="formula-body">
    <p><code>[Negative Adverb] + Auxiliary Verb (did/does/had/will/is) + Subject + Main Verb + ...</code></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 SSC CGL Questions on Inversion (Rule IV)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> Seldom <strong>he visits</strong> his parents.<br/>
    ✓ <em>Correct:</em> Seldom <strong>does he visit</strong> his parents. [हिंदी: वह कभी-कभार ही अपने माता-पिता से मिलने जाता है।]</p>
    
    <p>❌ <em>Incorrect:</em> Never <strong>I will</strong> see her face again.<br/>
    ✓ <em>Correct:</em> Never <strong>will I</strong> see her face again. [हिंदी: मैं उसका चेहरा फिर कभी नहीं देखूँगा।]</p>
    
    <p>❌ <em>Incorrect:</em> Hardly <strong>she had reached</strong> the station when the train left.<br/>
    ✓ <em>Correct:</em> Hardly <strong>had she reached</strong> the station when the train left. [हिंदी: वह स्टेशन पहुँची ही थी कि ट्रेन छूट गई।]</p>
    
    <p>❌ <em>Incorrect:</em> No sooner <strong>she reached</strong> the station than the train arrived.<br/>
    ✓ <em>Correct:</em> No sooner <strong>did she reach</strong> (or <strong>had she reached</strong>) the station than the train arrived.</p>
    
    <p>❌ <em>Incorrect:</em> So quickly <strong>she ran</strong> that she overtook her rivals.<br/>
    ✓ <em>Correct:</em> So quickly <strong>did she run</strong> that she overtook her rivals.</p>
  </div>
</div>""")

    # Rule V, VI, VII: Else/Other, Never vs Not, Fixed Correlatives
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule V, VI & VII: Else...but, Never vs Not & Fixed Idiomatic Phrases</h3>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Rule</th>
      <th>Grammatical Requirement</th>
      <th>Correct & Incorrect SSC Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Rule V: Else & Other</strong></td>
      <td>• <strong>Else</strong> is followed by <strong>BUT</strong>.<br/>• <strong>Other / Otherwise</strong> is followed by <strong>THAN</strong>.</td>
      <td>❌ <em>It is nothing else than sheer madness.</em><br/>✓ <em>It is nothing else <strong>but</strong> sheer madness.</em><br/>❌ <em>She had no other alternative but stay here.</em><br/>✓ <em>She had no other alternative <strong>than</strong> stay here.</em></td>
    </tr>
    <tr>
      <td><strong>Rule VI: Never vs Not</strong></td>
      <td>• <strong>Never:</strong> Means <em>at no time</em> (for habitual/general actions).<br/>• <strong>Not:</strong> Used for a specific single past occasion.</td>
      <td>❌ <em>I never went to Ooty last year.</em><br/>✓ <em>I <strong>did not go</strong> to Ooty last year.</em> (विशिष्ट बीते समय के लिए 'never' नहीं, 'did not' आएगा!)<br/>✓ <em>I <strong>never tell</strong> a lie.</em> (आदतन - सही है)</td>
    </tr>
    <tr>
      <td><strong>Rule VII: Fixed Phrases</strong></td>
      <td>चार सही मुहावरेदार वाक्यांश:<br/>1. <code>seldom or never</code><br/>2. <code>seldom, if ever</code><br/>3. <code>little or nothing</code><br/>4. <code>little, if anything</code></td>
      <td>❌ <em>We seldom or ever meet our relatives.</em><br/>✓ <em>We <strong>seldom or never</strong> (or <strong>seldom, if ever</strong>) meet our relatives.</em><br/>❌ <em>We have little or anything to say.</em><br/>✓ <em>We have <strong>little or nothing</strong> to say.</em></td>
    </tr>
  </tbody>
</table>""")

    # Rule VIII: Avoiding Double Negatives
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule VIII: Avoiding Double Negatives (दोहरे नकारात्मक शब्दों से बचें)</h3>
  <p><span class="lang-en">Negative adverbs should never be paired with another negative word in the same clause. Two negatives make an affirmative and create grammatical redundancy:</span>
  <span class="lang-hi">नकारात्मक अर्थ वाले शब्दों के साथ वाक्य में दूसरा नकारात्मक शब्द (not, no, none, nothing) लगाना सख्त वर्जित है:</span></p>
</div>

<div class="callout-box alert">
  <p><strong>⚠️ Words with Built-in Negative Meaning (इनके साथ 'not' कभी न लगाएं):</strong><br/>
  1. <strong>Negative Adverbs:</strong> <code>seldom, nowhere, never, nothing, hardly, scarcely, barely, rarely, neither</code>.<br/>
  2. <strong>Negative Verbs:</strong> <code>deny</code> (इनकार करना), <code>forbid</code> (मना करना), <code>prevent</code>, <code>prohibit</code>.<br/>
  3. <strong>Negative Conjunctions:</strong> <code>until</code> (जब तक कि नहीं - समय), <code>unless</code> (जब तक कि नहीं - शर्त), <code>lest</code> (कहीं ऐसा न हो कि + should).</p>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 SSC Error Spotting (Rule VIII)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> She hardly knows <strong>nothing</strong> about the family.<br/>
    ✓ <em>Correct:</em> She hardly knows <strong>anything</strong> about the family. ['nothing' की जगह 'anything'!]</p>
    
    <p>❌ <em>Incorrect:</em> She denied that she <strong>had not</strong> stolen the watch.<br/>
    ✓ <em>Correct:</em> She denied that she <strong>had</strong> stolen the watch. ['denied' के बाद 'not' हटाएँ!]</p>
    
    <p>❌ <em>Incorrect:</em> <strong>Both of us are not</strong> going to the party.<br/>
    ✓ <em>Correct:</em> <strong>Neither of us is</strong> going to the party. ('Both + not' अंग्रेजी में अशुद्ध है!)</p>
    
    <p>❌ <em>Incorrect:</em> Wait here until I <strong>do not return</strong>.<br/>
    ✓ <em>Correct:</em> Wait here until I <strong>return</strong>.</p>
  </div>
</div>""")

    # Rule IX: Adjectives ending in -ly & Nouns confused as Adverbs
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule IX: Words Confused Between Adjectives & Adverbs (-ly वाले विशेषण)</h3>
  <p><span class="lang-en">A very common misconception is that every word ending in <code>-ly</code> is an adverb. Many words ending in <code>-ly</code> are strictly <strong>Adjectives</strong>!</span>
  <span class="lang-hi">छात्र अक्सर सोचते हैं कि हर <code>-ly</code> वाला शब्द Adverb होता है। वास्तव में Noun + ly मिलकर <strong>Adjective</strong> बनाते हैं:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Noun Form</th>
      <th>Adjective Form (-ly)</th>
      <th>Adverbial Form (ढंग बताने हेतु)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Coward</strong> (कायर व्यक्ति)</td>
      <td><strong>Cowardly</strong> (कायरतापूर्ण)</td>
      <td><strong>In a cowardly manner</strong> (कायरता से)</td>
    </tr>
    <tr>
      <td><strong>Miser</strong> (कंजूस व्यक्ति)</td>
      <td><strong>Miserly</strong> (कंजूसी भरा)</td>
      <td><strong>In a miserly manner</strong> (कंजूसी से)</td>
    </tr>
    <tr>
      <td><strong>Niggard</strong> (कंजूस)</td>
      <td><strong>Niggardly</strong> (कंजूस)</td>
      <td><strong>In a niggardly manner</strong></td>
    </tr>
    <tr>
      <td><strong>Scholar</strong> (विद्वान)</td>
      <td><strong>Scholarly</strong></td>
      <td><strong>In a scholarly manner</strong></td>
    </tr>
    <tr>
      <td><strong>Friend</strong> (मित्र)</td>
      <td><strong>Friendly</strong></td>
      <td><strong>In a friendly manner</strong></td>
    </tr>
    <tr>
      <td><strong>Man</strong> (पुरुष)</td>
      <td><strong>Manly</strong> (मर्दाना)</td>
      <td><strong>In a manly manner</strong></td>
    </tr>
    <tr>
      <td><strong>Order</strong></td>
      <td><strong>Orderly</strong></td>
      <td><strong>In an orderly manner / in order</strong></td>
    </tr>
  </tbody>
</table>

<div class="callout-box alert">
  <p><strong>⚠️ Crucial Vocabulary Pairs:</strong><br/>
  • <strong>Fast:</strong> 'Fastly' अंग्रेजी भाषा में कोई शब्द नहीं है! <strong>Fast</strong> ही Adjective और Adverb दोनों है (<em>He runs fast</em>).<br/>
  • <strong>Outright:</strong> 'Outrightly' गलत है; सही शब्द <strong>outright</strong> है (<em>She rejected the proposal outright</em>).<br/>
  • <strong>Hard vs Hardly:</strong> <strong>Hard</strong> = कठिन/मेहनत से (Affirmative); <strong>Hardly</strong> = लगभग नहीं (Negative).<br/>
  • <strong>Late vs Lately:</strong> <strong>Late</strong> = देर से; <strong>Lately</strong> = हाल ही में (Recently).<br/>
  • <strong>Loudly vs Aloud:</strong> <strong>Loudly</strong> = ऊँची कर्कश आवाज़ में; <strong>Aloud</strong> = इतनी आवाज़ में जो सुनी जा सके (Audibly).</p>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 SSC Shift Questions (Rule IX)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> A soldier is trained never to fight <strong>cowardly</strong>.<br/>
    ✓ <em>Correct:</em> A soldier is trained never to fight <strong>in a cowardly manner</strong>. [लड़ने का ढंग → Adverbial phrase!]</p>
    
    <p>❌ <em>Incorrect:</em> He was driving very <strong>fastly</strong>.<br/>
    ✓ <em>Correct:</em> He was driving very <strong>fast</strong>. ['fastly' शब्द ही नहीं होता!]</p>
    
    <p>❌ <em>Incorrect:</em> The teacher asked the students to speak <strong>loudly</strong>.<br/>
    ✓ <em>Correct:</em> The teacher asked the students to speak <strong>aloud</strong>. [ताकि सब सुन सकें → 'aloud'!]</p>
  </div>
</div>""")

    # Rule X: Very, Much, So, Too, Enough, Rather
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule X: Very, Much, Too, So, Enough & Rather</h3>
</div>

<h3>1. Very vs Much (अत्यधिक vs बहुत)</h3>
<table class="notes-table">
  <thead>
    <tr>
      <th>Usage of 'Very'</th>
      <th>Usage of 'Much'</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>• Positive Degree के साथ: <em>She is <strong>very good</strong>.</em></td>
      <td>• Comparative Degree के साथ: <em>She is <strong>much better</strong> than her sister.</em></td>
    </tr>
    <tr>
      <td>• Present Participle (V-ing) के साथ: <em>a <strong>very interesting</strong> movie.</em></td>
      <td>• Past Participle (V3) के साथ: <em>He was <strong>much exhausted</strong> / pleased.</em></td>
    </tr>
    <tr>
      <td>• Superlative में: <em>She is <strong>the very best</strong> student.</em></td>
      <td>• Superlative में: <em>She is <strong>much the best</strong> student.</em></td>
    </tr>
  </tbody>
</table>

<h3>2. Position of 'Enough' (Enough का स्थान - बार-बार पूछा जाने वाला नियम)</h3>
<div class="callout-box alert">
  <p><strong>⚠️ 'Enough' Placement Formula:</strong><br/>
  1. जब 'Enough' <strong>Adjective</strong> हो: यह <strong>Noun से पहले</strong> आता है:<br/>
  👉 <em>He has <strong>enough money</strong> to buy a car.</em> ✓<br/>
  2. जब 'Enough' <strong>Adverb</strong> हो: यह जिस <strong>Adjective (Positive Degree)</strong> की विशेषता बताता है, उसके <strong>हमेशा बाद में</strong> आता है:<br/>
  ❌ <em>She is enough wise to understand the problem.</em><br/>
  ✓ <strong>She is wise enough to understand the problem.</strong> [Positive Degree + enough!]</p>
</div>

<h3>3. 'Too... to' vs 'So... that'</h3>
<p>• <strong>Too + Adjective + to + V1:</strong> नकारात्मक परिणाम दर्शाता है (इतना अधिक कि नहीं हो सकता):<br/>
👉 <em>He is <strong>too weak to walk</strong>.</em> = <em>He is <strong>so weak that he cannot walk</strong>.</em><br/>
• केवल 'too' का प्रयोग 'very' के स्थान पर सकारात्मक अर्थ में न करें (<em>He is too healthy</em> ❌ → <em>He is very healthy</em> ✓).</p>""")

    # Rule XI, XII, XIII: Too/As well/Also, Echo Tags & Verbs Dropping 'As'
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule XI, XII & XIII: Echo Tags & Verbs that DROP 'As'</h3>
</div>

<h3>Rule XI: Echo Tags (So did I / Neither did I)</h3>
<p>जब दो व्यक्ति एक ही कार्य करते हैं, तो दूसरे व्यक्ति की सहमति दर्शाने के लिए:</p>
<ul>
  <li><strong>सकारात्मक वाक्य में (Affirmative):</strong> <code>So + Auxiliary + Subject</code><br/>
  • <em>She won the prize and <strong>so did her sister</strong>.</em> (उसने पुरस्कार जीता और उसकी बहन ने भी।)</li>
  <li><strong>नकारात्मक वाक्य में (Negative):</strong> <code>Neither + Auxiliary + Subject</code><br/>
  • <em>He does not write well and <strong>neither do I</strong>.</em> (वह अच्छा नहीं लिखता और न ही मैं।)</li>
</ul>

<h3>Rule XIII: Verbs Taking 'As' vs Verbs that DROP 'As' (100% SSC Favorite)</h3>
<div class="callout-box info">
  <p><strong>1. Verbs that TAKE 'As' (इनके बाद 'as' लगना अनिवार्य है):</strong><br/>
  <code>regard, describe, define, treat, view, know</code><br/>
  • <em>I regard him <strong>as</strong> my mentor.</em> ✓<br/>
  • <em>Science has been defined <strong>as</strong> the systematic study of nature.</em> ✓</p>
</div>

<div class="callout-box alert">
  <p><strong>2. Verbs that DROP 'As' (इनके बाद 'as' लगाना सख्त अशुद्ध है):</strong><br/>
  <code>name, elect, think, consider, call, appoint, make, choose</code><br/>
  ❌ <em>She is considered <strong>as</strong> the best dancer.</em> → ✓ <strong>She is considered the best dancer.</strong><br/>
  ❌ <em>The principal appointed him <strong>as</strong> peon.</em> → ✓ <strong>The principal appointed him peon.</strong><br/>
  ❌ <em>He was elected <strong>as</strong> the secretary.</em> → ✓ <strong>He was elected the secretary.</strong><br/>
  ❌ <em>The teacher called him <strong>as</strong> intelligent.</em> → ✓ <strong>The teacher called him intelligent.</strong></p>
</div>""")

    # 5. Solved Shift PYQ Practice Set
    html.append("""<h2><span class="lang-en">4. SSC CGL/CHSL Solved Shift Questions (PYQ Spotting Errors)</span><span class="lang-hi">4. विगत वर्षों के हल प्रश्न (विस्तृत व्याख्या सहित)</span></h2>

<div class="pyq-box">
  <div class="pyq-title">Q1. SSC CGL Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"Scarcely had the bus stopped / when the passengers rushed / to get off the bus fastly / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 3.</strong> अंग्रेजी व्याकरण में <code>fastly</code> कोई शब्द नहीं होता। सही Adverb <strong>fast</strong> होता है।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"Scarcely had the bus stopped when the passengers rushed to get off the bus <strong>fast</strong>."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q2. SSC CHSL Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"He is enough rich / to buy a luxury bungalow / in the heart of the city / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 1.</strong> जब 'enough' Adverb के रूप में किसी Adjective की विशेषता बताता है, तो यह Adjective के <strong>बाद</strong> आता है। अतः <code>enough rich</code> अशुद्ध है, सही रूप <strong>rich enough</strong> होगा।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"He is <strong>rich enough</strong> to buy a luxury bungalow in the heart of the city."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q3. SSC CPO Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"The committee appointed him / as the head of the / finance department last month / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 2.</strong> क्रिया <code>appoint</code>, <code>elect</code>, <code>consider</code> के बाद 'as' का प्रयोग नहीं किया जाता।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"The committee appointed him <strong>the head of the</strong> finance department last month."</em></p>
  </div>
</div>""")

    # 6. FAQs
    html.append("""<h2><span class="lang-en">5. Frequently Asked Questions (FAQs)</span><span class="lang-hi">5. अक्सर पूछे जाने वाले प्रश्न</span></h2>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q1. What is the Law of Inversion in adverbs?</strong><br/>
  <strong>Ans:</strong> When a sentence begins with a negative or restrictive adverb like <em>Seldom, Hardly, Scarcely, Never, No sooner</em>, the auxiliary verb is placed before the subject (e.g. <em>Hardly had I arrived...</em>).</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q2. Can 'cowardly' be used as an adverb?</strong><br/>
  <strong>Ans:</strong> No. 'Cowardly' is an adjective. To use it as an adverb of manner, you must use the phrase <strong>in a cowardly manner</strong>.</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q3. Which verbs do not take 'as'?</strong><br/>
  <strong>Ans:</strong> The verbs <em>call, appoint, elect, consider, choose, make, name, think</em> do not take 'as' before their complement.</p>
</div>""")

    # 7. CTA Card
    html.append("""<div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 24px; border-radius: 14px; margin: 30px 0; text-align: center;">
  <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 19px; font-weight: 800;">Master Adverb Inversion in Real Exam Mode</h3>
  <p style="margin: 0 0 16px 0; color: #dbeafe; font-size: 14px;">Practice official SSC shift questions with instant solutions, analysis, and percentiles.</p>
  <a href="/papers" style="display: inline-block; background: #ffffff; color: #1e3a8a; font-weight: 800; padding: 11px 22px; border-radius: 8px; text-decoration: none; font-size: 14px;">
    Attempt SSC PYQ Shifts Now →
  </a>
</div>""")

    return "\n\n".join(html)

if __name__ == "__main__":
    content = build_adverb_content()
    print("Adverb content generated successfully!")
    print("Total characters:", len(content))
    print("Total words:", len(content.split()))
