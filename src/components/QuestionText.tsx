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

  // Pattern 11: Sentence Rearrangement
  m = text.match(/^Sentences of a paragraph are given below in jumbled order\.?\s*Select the option that gives their correct order\s*:\s*([\s\S]*)$/i);
  if (m) {
    return {
      instruction: 'Sentence Rearrangement (Para Jumble)',
      mainText: m[1].trim() || 'Select the correct order of the jumbled sentences:'
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
    const trimmed = content.trim();

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

    // Check if mainText has multiline sentence fragments e.g. A. ... \n B. ... \n C. ...
    if (/\n\s*[A-DP-S][\.\)]\s+/.test(trimmed)) {
      const parts = trimmed.split(/\n/);
      return (
        <div className="space-y-1.5 mt-1.5">
          {parts.map((part, idx) => {
            const line = part.trim();
            if (!line) return null;
            const fragMatch = line.match(/^([A-DP-S1-6])[\.\)]\s*(.*)/);
            if (fragMatch) {
              return (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-indigo-600 text-white text-[11px] font-black shrink-0 shadow-2xs">
                    {fragMatch[1]}
                  </span>
                  <div className="flex-1 text-slate-800 font-medium text-sm sm:text-base leading-relaxed pt-0.5">
                    <MathText text={fragMatch[2]} />
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} className="text-gray-900 font-bold leading-relaxed">
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
    <div className={`space-y-1.5 ${className} break-words`}>
      {showInstructionBadge && (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-900 border border-blue-200 shadow-2xs max-w-full">
          <span className="text-blue-600">📌</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Directive:</span>
          <span className="text-slate-800 truncate">{instruction}</span>
        </div>
      )}
      <div className="text-gray-900 leading-relaxed font-bold text-sm sm:text-base md:text-lg break-words">
        {renderFormattedMainText(mainText)}
      </div>
    </div>
  );
}
