import MathText from "@/components/MathText";

export function parseQuestionHeading(rawText?: string | null): { instruction: string | null; mainText: string } {
  if (!rawText) return { instruction: null, mainText: "" };
  const text = rawText.trim();

  // Pattern 1: "Select the most appropriate synonym/antonym of the word 'XYZ'."
  let m = text.match(/^Select the most appropriate (synonym|antonym) of the word ["“']?([^"”'\.]+)["”']?\s*\.?$/i);
  if (m) {
    const type = m[1].toLowerCase() === 'synonym' ? 'Synonym' : 'Antonym';
    return {
      instruction: `Select the most appropriate ${type}`,
      mainText: `Word: "${m[2].trim()}"`
    };
  }

  // Pattern 2: "Select the most appropriate synonym/antonym of 'XYZ' in the following sentence: ..."
  m = text.match(/^Select the most appropriate (synonym|antonym) of ([\s\S]+?)\s*:\s*([\s\S]+)$/i);
  if (m) {
    const type = m[1].toLowerCase() === 'synonym' ? 'Synonym' : 'Antonym';
    return {
      instruction: `Select the most appropriate ${type} of ${m[2].trim()}`,
      mainText: m[3].trim()
    };
  }

  // Pattern 3: Active / Passive Voice
  m = text.match(/^(?:Select the correct active\/passive voice form of the given sentence|Select the correct active\/passive form of the given sentence|Change into active\/passive voice)\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Active / Passive Voice',
      mainText: m[1].trim()
    };
  }

  // Pattern 4: Direct / Indirect Narration
  m = text.match(/^(?:Select the correct direct\/indirect form of the given sentence|Select the correct direct\/indirect form)\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Direct / Indirect Narration',
      mainText: m[1].trim()
    };
  }

  // Pre-process: Strip redundant "If there is no need to substitute..." text
  const cleanText = text
    .replace(/If there is no need to substitute it, select ['"]No substitution required['"]\s*[:\.]?/gi, '')
    .replace(/Select the most appropriate option that can substitute the underlined segment in the given sentence\.?\s*[:\.]?/gi, 'Select option to substitute underlined segment:')
    .replace(/Select the option that can substitute the underlined segment in the given sentence\.?\s*[:\.]?/gi, 'Select option to substitute underlined segment:')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Pattern 5: One-word substitution or Segment substitution
  m = cleanText.match(/^(?:Select the option that can be used as a one-word substitute for the given phrase|Select option to substitute underlined segment|Select the option that can substitute the bracketed segment)\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Sentence Improvement / Substitution',
      mainText: m[1].trim()
    };
  }

  // Pattern 6: Spelling Test
  if (/^Select the (?:correctly|INCORRECTLY) spelt word\.?$/i.test(text)) {
    const isIncorrect = /INCORRECTLY/i.test(text);
    return {
      instruction: isIncorrect ? 'Select the INCORRECTLY spelt word' : 'Select the CORRECTLY spelt word',
      mainText: isIncorrect ? 'Which of the following words is spelt incorrectly?' : 'Which of the following words is spelt correctly?'
    };
  }

  // Pattern 7: Idioms and Phrases
  m = text.match(/^Select the most appropriate meaning of (?:the underlined idiom in the given sentence|the given idiom)\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Meaning of Idiom / Phrase',
      mainText: m[1].trim()
    };
  }

  // Pattern 8: Grammatical Error Identification
  m = text.match(/^(?:The following sentence has been split into four segments|Parts of the following sentence have been given as options|Identify the segment in the sentence which contains a grammatical error)\s*\.?\s*(?:Identify the segment that contains a grammatical error|Select the option that contains an error)?\s*:\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Identify Grammatical Error',
      mainText: m[1].trim()
    };
  }

  // Pattern 9: Fill in the blank / Homophones
  m = text.match(/^(?:Select the most appropriate option to fill in the blank|Select the most appropriate homophone to fill in the blank)\s*[:\.]?\s*([\s\S]+)$/i);
  if (m) {
    return {
      instruction: 'Fill in the blank',
      mainText: m[1].trim()
    };
  }

  // Pattern 10: Cloze Test
  m = text.match(/^Read the following passage and select the most appropriate option to fill in blank No\.?\s*\(?(\d+)\)?\s*:\s*(?:Passage\s*:\s*)?([\s\S]+)$/i);
  if (m) {
    return {
      instruction: `Cloze Test (Blank No. ${m[1]})`,
      mainText: m[2].trim()
    };
  }

  // Pattern 11: Sentence / Para Jumble Rearrangement
  m = text.match(/^(?:Sentences of a paragraph are given below in jumbled order|Parts of a sentence are given below in jumbled order|The following sentences are in jumbled order|Rearrange the parts of the sentence in correct order)[\.\:\s]+(?:Select the option that gives their correct order|Arrange the parts in the correct order to form a meaningful sentence|Arrange them in the correct sequence)?\s*[:\.]?\s*([\s\S]*)$/i);
  if (m) {
    return {
      instruction: 'Sentence Rearrangement (Para Jumble)',
      mainText: m[1].trim() || 'Arrange in the correct meaningful order:'
    };
  }

  // Pattern 12: Explicit DIRECTIONS prefix e.g. "DIRECTIONS: ... \n\n"
  const normText = text.replace(/\r\n/g, '\n');
  const directionsMatch = normText.match(/^(?:DIRECTIONS(?:\s*\([^)]*\))?\s*:\s*)([\s\S]+?)\n\s*\n([\s\S]+)$/i);
  if (directionsMatch) {
    return {
      instruction: directionsMatch[1].trim(),
      mainText: directionsMatch[2].trim()
    };
  }

  // Generic Pattern: "Instruction text:" followed by main text
  m = text.match(/^(Select the [^:]+:|Identify the [^:]+:|In the following [^:]+:)\s*([\s\S]+)$/i);
  if (m && m[2].trim().length > 0) {
    return {
      instruction: m[1].replace(/:$/, '').trim(),
      mainText: m[2].trim()
    };
  }

  return { instruction: null, mainText: text };
}

export default function QuestionText({
  text,
  className = "",
  showInstructionBadge = true,
}: {
  text?: string | null;
  className?: string;
  showInstructionBadge?: boolean;
}) {
  if (!text) return null;

  const { instruction, mainText } = parseQuestionHeading(text);

  // Helper to format target words e.g. Word: "Hind" -> styled pill
  const renderFormattedMainText = (content: string) => {
    if (!content) return null;
    const norm = content.replace(/\r\n/g, '\n').trim();

    // Check if content is a Reading Comprehension passage with question
    const passageMatch = norm.match(/(?:^|\n)\s*PASSAGE\s*:\s*([\s\S]+?)\n\s*(?:QUESTION|Q)\s*:\s*([\s\S]+)$/i);
    if (passageMatch) {
      const passageBody = passageMatch[1].trim();
      const questionPrompt = passageMatch[2].trim();
      const paragraphs = passageBody.split(/\n\s*\n+/).filter(Boolean);
      const wordCount = passageBody.split(/\s+/).filter(Boolean).length;
      const readMinutes = Math.max(1, Math.ceil(wordCount / 180));

      return (
        <div className="w-full space-y-3.5 sm:space-y-4">
          <div className="w-full rounded-xl sm:rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/70 via-amber-50/40 to-amber-50/20 dark:bg-amber-950/20 dark:border-amber-900/50 p-2.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 mb-2.5 text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                <span>📖</span>
                <span>Reading Passage</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-amber-800/80 dark:text-amber-400">
                <span>~{wordCount} words</span>
                <span>•</span>
                <span>⏱️ {readMinutes} min read</span>
              </div>
            </div>
            <div className="space-y-2.5 sm:space-y-3.5 text-slate-800 dark:text-slate-100 text-[13.5px] sm:text-[15px] leading-relaxed font-normal tracking-normal selection:bg-amber-200">
              {paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  <MathText text={para.trim()} />
                </p>
              ))}
            </div>
          </div>

          <div className="w-full pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900 mb-1.5">
              <span>❓</span>
              <span>Question Prompt</span>
            </div>
            <div className="text-slate-900 dark:text-white font-bold text-sm sm:text-base md:text-lg leading-snug">
              <MathText text={questionPrompt} />
            </div>
          </div>
        </div>
      );
    }

    const trimmed = norm;

    // If it starts with Word: "XYZ"
    const wordMatch = trimmed.match(/^(Word:\s*)(["“'].*?["”'])/i);
    if (wordMatch) {
      const rest = trimmed.slice(wordMatch[0].length);
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-600 font-bold">Word:</span>
          <span className="inline-flex items-center rounded-lg bg-amber-100/90 px-2.5 py-0.5 text-sm sm:text-base font-black text-amber-950 border border-amber-300/80 shadow-2xs">
            {wordMatch[2].replace(/["“']/g, '')}
          </span>
          {rest && <MathText text={rest} />}
        </div>
      );
    }

    // Check if question is bilingual (contains full English sentence followed by Hindi)
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(trimmed)) {
      const firstHi = trimmed.search(devanagariRegex);
      const prefix = trimmed.substring(0, firstHi).trim();
      const wordsInPrefix = prefix.split(/\s+/).filter(Boolean).length;

      // Only treat as bilingual if prefix has at least 4 tokens AND contains lowercase English words (so code chains like "P 16 : R 18" don't split on colons)
      if (wordsInPrefix >= 4 && /\b[A-Za-z]*[a-z]{2,}\b/.test(prefix)) {
        const m = prefix.match(/(\?|\.\s|\.\n|\:\s*)\s*(["'\w\s\d\+\-\=\/\^\{\}\(\)\[\]]{0,60})$/);
        let en = prefix;
        let hi = trimmed.substring(firstHi).trim();
        if (m && m.index !== undefined) {
          const punctPos = m.index + m[1].length;
          en = trimmed.substring(0, punctPos).trim();
          hi = trimmed.substring(punctPos).trim();
        }

        if (en && hi) {
          return (
            <div className="space-y-2">
              <div className="text-slate-900 font-bold leading-relaxed break-words">
                <MathText text={en} />
              </div>
              <div className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed pt-1.5 border-t border-slate-100 break-words">
                <MathText text={hi} />
              </div>
            </div>
          );
        }
      }
    }

    // Check if mainText has multiline sentence fragments e.g. P. ... \n Q. ... or (A) ... \n (B) ... or S1. ... \n S6. ...
    if (/\n\s*(?:\(?[A-Za-z0-9]{1,3}\)[\.\:]?|[A-Za-z0-9]{1,3}[\.\:\)])\s+/.test(trimmed)) {
      const parts = trimmed.split(/\n/);
      return (
        <div className="space-y-1.5 mt-1.5">
          {parts.map((part, idx) => {
            const line = part.trim();
            if (!line) return null;
            const fragMatch = line.match(/^(?:\(?([A-Za-z0-9]{1,3})\)[\.\:]?|([A-Za-z0-9]{1,3})[\.\:\)])\s*(.*)/);
            if (fragMatch) {
              const badgeLabel = fragMatch[1] || fragMatch[2];
              return (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors">
                  <span className="inline-flex items-center justify-center min-w-[22px] px-1.5 h-5.5 rounded-md bg-indigo-600 text-white text-[11px] font-black shrink-0 shadow-2xs">
                    {badgeLabel}
                  </span>
                  <div className="flex-1 text-slate-800 dark:text-slate-200 font-medium text-sm sm:text-base leading-relaxed pt-0.5">
                    <MathText text={fragMatch[3]} />
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} className="text-gray-900 dark:text-gray-100 font-bold leading-relaxed">
                <MathText text={line} />
              </div>
            );
          })}
        </div>
      );
    }

    return <MathText text={trimmed} />;
  };

  if (!instruction) {
    return (
      <div className={`break-words ${className}`}>
        {renderFormattedMainText(text)}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className} break-words`}>
      {showInstructionBadge && (
        instruction.length > 50 ? (
          <div className="rounded-lg bg-blue-50/80 border border-blue-200/90 px-3 py-2 shadow-2xs mb-2">
            <div className="flex items-start gap-1.5 text-xs text-blue-900 leading-snug">
              <span className="shrink-0 text-blue-700 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <span>📌</span> Directions:
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-200">
                {instruction}
              </span>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900 border border-blue-200 shadow-2xs max-w-full mb-1">
            <span className="text-blue-600">📌</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Directive:</span>
            <span className="text-slate-800">{instruction}</span>
          </div>
        )
      )}
      <div className="text-gray-900 leading-relaxed font-bold text-sm sm:text-base md:text-lg break-words">
        {renderFormattedMainText(mainText)}
      </div>
    </div>
  );
}
