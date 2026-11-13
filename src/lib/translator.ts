// High-Reliability Hindi Translation & Asset Protection Engine
// Strictly protects: Image paths, Reasoning codes, Letter clusters, Math formulae & English Section

const translationCache = new Map<string, string>();
const inFlightTranslations = new Map<string, Promise<string>>();

// ── Check if text already contains Hindi/Devanagari script ──
export function hasHindi(value?: string | null): boolean {
  if (!value) return false;
  return /[\u0900-\u097F]/.test(value);
}

// ── Determines whether an option is a descriptive sentence that can be translated ──
// Strictly protects: Reasoning codes (MoNdAy, BSIhHU), letters (BD : JL, LOM), numbers, units (1080 rupees), formulas, and diagrams
export function isTranslatableOption(text?: string | null, isQuantSection: boolean = false): boolean {
  if (!text || !text.trim()) return false;
  const trimmed = text.trim();

  // 1. Skip if already bilingual or contains Hindi
  if (hasHindi(trimmed)) return false;

  // 2. Skip if it is or contains an image tag
  if (trimmed.includes("![") || trimmed.includes("/images/") || trimmed.includes("<img")) return false;

  // 3. Skip pure numeric, algebraic, ratio, coordinate, or currency expressions
  if (/^[0-9\s.,+\-*/=^()√∛%:;₹$€£–—±<>°]+$/.test(trimmed)) return false;

  // 4. Skip numeric values with standard measurement units (e.g. "1080 rupees", "5.5 cm", "8 days", "25%", "8√2")
  if (/^[-+]?[\d.,\s√]+\s*(?:cm|m|km|mm|cm²|cm³|m²|sec|min|hr|hours?|days?|rupees?|rs\.?|kg|gm|%|°|deg|radians?)?$/i.test(trimmed)) {
    return false;
  }

  // 5. If this is Quantitative Aptitude, options are almost always formulas, numbers, or expressions
  if (isQuantSection) {
    // Only allow pure English multi-word sentences like "Cannot be determined", "Data insufficient", "None of the above"
    const words = trimmed.match(/[A-Za-z]{3,}/g) ?? [];
    if (words.length < 3 || /\d|[\+\-\*\/\^=√]/.test(trimmed)) {
      return false;
    }
  }

  // 6. Skip letter codes, casing ciphers, and series (e.g. "MoNdAy", "TiIoGt", "BSIhHU", "BD : JL", "LOM", "F")
  if (/^[A-Za-z0-9\s,:\-_+*]+$/.test(trimmed)) {
    const tokens = trimmed.split(/[\s,:\-_+*]+/).filter(Boolean);

    // Single letter options (e.g. "A", "B", "F")
    if (tokens.length === 1 && tokens[0].length === 1) return false;

    // Mixed-case code words (e.g. "MoNdAy", "TiIoGt", "BsIHHu")
    if (tokens.some((w) => /^[A-Z]+[a-z]+[A-Z]/.test(w) || /^[a-z]+[A-Z]/.test(w))) return false;

    // All uppercase tokens (e.g. "BD", "JL", "LOM", "ZEA") - except standard English words
    const commonWords = new Set(["A", "THE", "AN", "AND", "OR", "NOT", "BOTH", "ALL", "NONE", "NEITHER", "EITHER", "ONLY"]);
    if (tokens.every((w) => /^[A-Z0-9]+$/.test(w) && w.length <= 8 && !commonWords.has(w))) {
      return false;
    }
  }

  // 7. Only translate if option has at least 2 descriptive English words (containing lowercase letters)
  // Examples that pass: "Neither conclusion I nor II follows", "Only statement I is correct", "Both 1 and 2 follow"
  // Skips code mappings like "# = BNQ, % = NFM"
  const englishWords = trimmed.match(/\b[A-Za-z]*[a-z]{2,}\b/g) ?? [];
  return englishWords.length >= 2;
}

const EMPHASIS_UPPER_WORDS = new Set([
  "NOT", "ONLY", "TRUE", "FALSE", "CORRECT", "INCORRECT", "CORRECTLY", "INCORRECTLY",
  "BOTH", "NEITHER", "EITHER", "EXCEPT", "ALL", "NONE", "AND", "OR", "MUST", "NEVER", "ALWAYS",
]);

function isAnagramAnalogyChain(chain: string): boolean {
  const parts = chain.split(/\s*(?::\s*:|:)\s*/).map((p) => p.trim()).filter((p) => p && p !== "?");
  if (parts.length < 3 || parts.some((p) => /\s/.test(p) || p.length < 2)) return false;
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const a = parts[i].toLowerCase();
    const b = parts[i + 1].toLowerCase();
    if (a.length === b.length && a !== b && a.split("").sort().join("") === b.split("").sort().join("")) {
      return true;
    }
  }
  return false;
}

// ── Protect sensitive content before machine translation ──
function maskProtectedTokens(text: string): { maskedText: string; tokens: string[] } {
  const tokens: string[] = [];
  // Opaque Unicode bracket token with no A-Z letters so Google Translate never translates it (e.g. "PROTECT" -> "रक्षा")
  const placeholder = (idx: number) => `⟦${idx}⟧`;

  let current = text;

  const pushToken = (val: string) => {
    tokens.push(val);
    return placeholder(tokens.length - 1);
  };

  // Helper to safely replace regex matches (or a specific capture group) with tokens
  const replaceWithToken = (
    regex: RegExp,
    guard?: (val: string) => boolean,
    captureGroupIdx?: number
  ) => {
    current = current.replace(regex, (...args) => {
      const fullMatch = args[0] as string;
      const target = captureGroupIdx ? (args[captureGroupIdx] as string) : fullMatch;
      if (!target || (guard && !guard(target))) {
        return fullMatch;
      }
      if (!captureGroupIdx) {
        return pushToken(fullMatch);
      }
      // Reconstruct match replacing only the target capture group without relying on variable lookbehind
      const groupOffset = fullMatch.lastIndexOf(target);
      if (groupOffset === -1) return fullMatch;
      return (
        fullMatch.slice(0, groupOffset) +
        pushToken(target) +
        fullMatch.slice(groupOffset + target.length)
      );
    });
  };

  // 1. Protect Markdown Images & HTML Tags
  replaceWithToken(/!\[[^\]]*\]\([^\s)]+\)/g);
  replaceWithToken(/<img\b[^>]*>/gi);
  replaceWithToken(/<[^>]+>/g);

  // 1b. Protect Markdown Table Alignment Separator Rows (e.g. | :--- | :--- |)
  replaceWithToken(/\|[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)+\|/g);

  // 1c. Protect Row/Item Index Labels in tables, lists, and statements (e.g. | i. , | a. , \n1. , \n(A) , \n(i) )
  // Strictly protects labels so "i." does not turn into "मैं", "a." does not turn into "एक", "ii." does not turn into "द्वितीय"
  replaceWithToken(
    /(^|[\n|])\s*(\(?[a-zA-Z1-9ivxIVX]{1,4}\)?[.\)])(?=\s+)/g,
    undefined,
    2
  );

  // 2. Protect LaTeX Math Delimiters
  replaceWithToken(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)/g);

  // 3. Protect Quoted words/codes (match each quote type up to 60 chars so mismatched OCR quotes never swallow sentences)
  replaceWithToken(/(?:"[^"\n]{1,60}"|'[^'\n]{1,60}')/g);

  // 4. Protect Mixed-Case Coding Words (e.g. MoNdAy, TiIoGt, BsIHHu)
  replaceWithToken(/\b(?:[A-Z]+[a-z]+[A-Z][A-Za-z]*|[a-z]+[A-Z]+[a-z]*)\b/g);

  // 5. Protect Reasoning Analogies, Series, and Cipher Codes (full chain so first term isn't partially translated)
  // 5a. Complete analogy chains like "BEAK : ORNX :: FILM : ?", "P 16 : R 18 :: I 9 : K 11 :: T 20 : ?", "# : VXB :: ACG : %", "6 : 8 :: 3 : ?", "Tis : Sit :: Tip : Pit :: Ten : ?"
  const codeTerm = "(?:[A-Z0-9?#%_]+(?:\\s+[A-Z0-9?#%_]+){0,2})";
  replaceWithToken(
    new RegExp(`(^|[^A-Za-z0-9])(${codeTerm}(?:\\s*(?::\\s*:|:)\\s*${codeTerm})+)(?![A-Za-z0-9])`, "g"),
    (s) =>
      (s.includes("::") || s.includes(": :") || (s.match(/:/g)?.length ?? 0) >= 2 || /[A-Z]{2,}|\d|[#%]/.test(s)) &&
      !/[a-z]/.test(s),
    2
  );
  replaceWithToken(
    /\b[A-Za-z]+\s*(?::\s*:|:)\s*[A-Za-z]+(?:\s*(?::\s*:|:)\s*(?:[A-Za-z]+|\?))+\b/g,
    (s) => isAnagramAnalogyChain(s)
  );

  // 5b. Comma-separated letter-cluster pairs & series (e.g. "DKG : HSN, VLM : ZTT", "BZTR, DBVT, FDXV, ?, JHBZ", "A, C, E, G")
  replaceWithToken(
    /\b[A-Z0-9?-]{2,}\s*:\s*[A-Z0-9?-]{2,}(?:\s*,\s*[A-Z0-9?-]{2,}\s*:\s*[A-Z0-9?-]{2,})+\b/g,
    (s) => !/[a-z]/.test(s)
  );
  const seriesItem = "(?:[A-Z0-9?-]+(?:\\s*:\\s*[A-Z0-9?-]+)?)";
  replaceWithToken(
    new RegExp(`(^|[^A-Za-z0-9])(${seriesItem}(?:\\s*,\\s*${seriesItem}){2,})(?![A-Za-z0-9])`, "g"),
    (s) => !/[a-z]/.test(s) && (/[A-Z]{2,}/.test(s) || (s.match(/\b[A-Z]\b/g)?.length ?? 0) >= 2),
    2
  );

  // 5c. Hyphenated codes & single uppercase letter pair (e.g. "W-T-P-M", "BD : JL")
  replaceWithToken(/\b[A-Z]{1,4}(?:-[A-Z]{1,4})+\b/g);
  replaceWithToken(/\b[A-Z0-9]{2,}\s*:\s*[A-Z0-9]{2,}\b/g, (s) => !/[a-z]/.test(s) && /[A-Z]/.test(s));

  // 5d. Alphanumeric Reasoning codes & blanks (e.g. "DM 12", "HQ 17", "R 4", "NP3", "I4D", "_____")
  replaceWithToken(/\b[A-Z]{1,4}\s+\d+\b/g);
  replaceWithToken(/\b(?:[A-Z]+\d+[A-Z0-9]*|\d+[A-Z]+[A-Z0-9]*)\b/g);
  replaceWithToken(/_{2,}/g);

  // 5e. Standalone ALL-CAPS cipher words in coding/analogy prose (e.g. "ACCIDENT is related to TNEDICCA", "is BANG related")
  replaceWithToken(
    /\b([A-Z]{2,})\b(?=\s+(?:(?:is\s+)?(?:related|coded|written|mapped)|means|denotes|stands|represents))/g,
    (s) => !EMPHASIS_UPPER_WORDS.has(s)
  );
  replaceWithToken(
    /\b(?:related to|coded as|written as|becomes|from)\s+([A-Z]{2,})\b/g,
    (s) => !EMPHASIS_UPPER_WORDS.has(s),
    1
  );

  // 6. Protect Trigonometric expressions (STRICT: prevents 'sin' becoming 'पाप', 'cot' becoming 'खाट')
  // Covers: sin A, sin θ, sin²A, cos A, tan B, cot θ, sec A, cosec A, csc θ, sin(90° - A)
  replaceWithToken(/\b(?:sin|cos|tan|cot|sec|cosec|csc)(?:²|³|\^[0-9]+)?(?:\s*(?:[A-Za-zθθαβγφxyz]|\([^\)\n]+\)|\d+°?))?\b/gi);

  // 7. Protect Geometric symbols & angles (e.g. △ABC, ∠ABC, ∠A, AB ⊥ CD, AB ∥ CD)
  replaceWithToken(/(?:△|∠|⊥|∥|≅|∼)\s*[A-Za-z0-9]+/g);

  // 8. Protect Coordinates (e.g. (3, 2), (-5, -2), (0, 3), (x, y))
  replaceWithToken(/\(\s*[-+]?\d*\.?\d+\s*,\s*[-+]?\d*\.?\d+\s*\)/g);
  replaceWithToken(/\(\s*[xyz]\s*,\s*[xyz]\s*\)/gi);

  // 9. Protect Ratios and Algebraic Equations (e.g. "3 : 4", "x = 4", "a + b = c")
  replaceWithToken(/\b\d+\s*:\s*\d+(?:\s*:\s*\d+)?\b/g);
  replaceWithToken(/\b[a-zA-Z]\s*=\s*[-+]?\d*\.?\d+\b/g);

  // 10. Protect Operator Substitution Codes (e.g. "16 D 4 A 8 C 2 B 5", "A denotes '+'")
  replaceWithToken(/\b\d+\s+[A-Z]\s+\d+(?:\s+[A-Z]\s+\d+)*\b/g);
  replaceWithToken(/\b[A-Z]\s+(?:denotes|means|stands for|represents)\b/gi);

  // 11. Normalize common SSC Math Phrases to prevent bad translations
  current = current.replace(/\b(?:The\s+sum\s+is)\b/gi, "मूलधन है");
  current = current.replace(/\b(?:A\s+sum\s+of\s+money|the\s+sum\s+of\s+money)\b/gi, "एक धनराशि");
  current = current.replace(/\bEvaluate:\s*/gi, "मान ज्ञात कीजिए: ");
  current = current.replace(/\bSimplify:\s*/gi, "सरल कीजिए: ");

  return { maskedText: current, tokens };
}

// ── Restore protected tokens into translated text with Bulletproof Regex ──
function unmaskTokens(translated: string, tokens: string[]): string {
  let result = translated;
  tokens.forEach((token, idx) => {
    const cleanPattern = new RegExp(`⟦\\s*${idx}\\s*⟧(\\s*)`, "g");
    result = result.replace(cleanPattern, (_m, trailingSpace) => {
      // If token is a list/table label (ends with . or )) and there's no trailing space, ensure one space
      if (/[.\)]$/.test(token.trim()) && !trailingSpace) {
        return `${token} `;
      }
      return token + trailingSpace;
    });

    const exact = `⟦${idx}⟧`;
    if (result.includes(exact)) {
      result = result.split(exact).join(token);
    }

    // Legacy fallback if a cached/historical string contains ___PROTECT_0___ or रक्षा_0___
    const legacyPattern = new RegExp(
      `(?:___|---|—)?\\s*(?:PROTECT|सुरक्षित|सुरक्षा|रक्षा|संरक्षित|प्रोटेक्ट)\\s*_?\\s*${idx}\\s*(?:___|---|—)`,
      "gi"
    );
    result = result.replace(legacyPattern, () => token);
  });
  return result;
}

// ── Google GTX Translation Caller with Network Resilience ──
async function requestTranslation(value: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(value)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Translation service responded with ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.[0]?.map((item: any) => item?.[0] || "").join("").trim();
  if (!translated) throw new Error("Translation service returned an empty response");
  return translated;
}

// ── Translate Plain English Statement into Clean Hindi ──
export async function translateToHindi(text: string): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed || hasHindi(trimmed)) return trimmed || "";

  // If text is purely an image tag, return instantly without network call
  if (/^!\[[^\]]*\]\([^\s)]+\)$/.test(trimmed)) {
    return trimmed;
  }

  const cached = translationCache.get(trimmed);
  if (cached) return cached;

  const active = inFlightTranslations.get(trimmed);
  if (active) return active;

  const pending = (async () => {
    // 1. Mask images, reasoning codes, math, and quoted ciphers
    const { maskedText, tokens } = maskProtectedTokens(trimmed);

    // If everything was masked or no English words left to translate
    if (!/[A-Za-z]{2,}/.test(maskedText)) {
      return trimmed;
    }

    try {
      const rawTranslated = await requestTranslation(maskedText);
      const restored = unmaskTokens(rawTranslated, tokens);
      translationCache.set(trimmed, restored);
      return restored;
    } catch {
      // Retry once on network glitch
      try {
        const rawTranslated = await requestTranslation(maskedText);
        const restored = unmaskTokens(rawTranslated, tokens);
        translationCache.set(trimmed, restored);
        return restored;
      } catch {
        return trimmed;
      }
    }
  })();

  inFlightTranslations.set(trimmed, pending);
  try {
    return await pending;
  } finally {
    inFlightTranslations.delete(trimmed);
  }
}

// ── Translate Single Question with Strict Options Protection ──
export async function translateSingleQuestion(
  q: any,
  isEnglishSection: boolean = false
): Promise<{
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  explanation: string;
}> {
  if (!q) {
    return { question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", explanation: "" };
  }

  // 1. STRICT RULE: English Comprehension section must NEVER be translated
  const isEng = isEnglishSection || (q.question_number && q.question_number >= 76);
  if (isEng) {
    return {
      question_text: q.question_text || "",
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      explanation: q.explanation || "",
    };
  }

  const isQuant = q.question_number && q.question_number >= 51 && q.question_number <= 75;

  // 2. Question Text: Use native Hindi if present, otherwise machine-translate with code protection
  const question_text = q.question_text_hi || (await translateToHindi(q.question_text || ""));

  // 3. Options: Only machine-translate descriptive sentences (e.g. "Neither conclusion I nor II follows")
  // Keep letter codes, diagrams, numbers, and formulas identical to source paper
  const translateOption = async (raw?: string | null, hi?: string | null) => {
    if (hi) return hi;
    if (!raw) return "";
    if (isTranslatableOption(raw, isQuant)) {
      return await translateToHindi(raw);
    }
    return raw;
  };

  const [option_a, option_b, option_c, option_d] = await Promise.all([
    translateOption(q.option_a, q.option_a_hi),
    translateOption(q.option_b, q.option_b_hi),
    translateOption(q.option_c, q.option_c_hi),
    translateOption(q.option_d, q.option_d_hi),
  ]);

  const explanation = q.explanation_hi || (q.explanation && hasHindi(q.explanation) ? q.explanation : "");

  return {
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    explanation,
  };
}
