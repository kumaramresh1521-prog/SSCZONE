// Global Translation Cache to avoid any duplicate network requests
const translationCache: Record<string, string> = {};

export async function translateToHindi(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  
  const trimmed = text.trim();
  if (translationCache[trimmed]) {
    return translationCache[trimmed];
  }

  // Check if text is already in Hindi (Devanagari script range)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (!res.ok) return trimmed;
    
    const data = await res.json();
    if (data && data[0]) {
      const translated = data[0].map((x: any) => x[0]).join("");
      translationCache[trimmed] = translated;
      return translated;
    }
  } catch (error) {
    console.error("Auto-Translation Error:", error);
  }

  return trimmed;
}

// Ultra-fast single-request translator for all 6 fields of a question
export async function translateSingleQuestion(q: any): Promise<{
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

  // 1. If native Hindi fields already exist in the database, return instantly (0ms)
  if (q.question_text_hi || q.option_a_hi) {
    return {
      question_text: q.question_text_hi || q.question_text || "",
      option_a: q.option_a_hi || q.option_a || "",
      option_b: q.option_b_hi || q.option_b || "",
      option_c: q.option_c_hi || q.option_c || "",
      option_d: q.option_d_hi || q.option_d || "",
      explanation: q.explanation_hi || q.explanation || ""
    };
  }

  const fields = [
    q.question_text || "",
    q.option_a || "",
    q.option_b || "",
    q.option_c || "",
    q.option_d || "",
    q.explanation || ""
  ];

  // 2. Check if all fields are already in cache
  const allCached = fields.every((f) => !f || translationCache[f.trim()]);
  if (allCached) {
    return {
      question_text: translationCache[fields[0].trim()] || fields[0],
      option_a: translationCache[fields[1].trim()] || fields[1],
      option_b: translationCache[fields[2].trim()] || fields[2],
      option_c: translationCache[fields[3].trim()] || fields[3],
      option_d: translationCache[fields[4].trim()] || fields[4],
      explanation: translationCache[fields[5].trim()] || fields[5]
    };
  }

  // 3. Ultra-Fast Parallel Translation of all 6 fields concurrently
  try {
    const [qText, optA, optB, optC, optD, expText] = await Promise.all(
      fields.map((f) => translateToHindi(f))
    );

    return {
      question_text: qText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      explanation: expText
    };
  } catch (e) {
    return {
      question_text: fields[0],
      option_a: fields[1],
      option_b: fields[2],
      option_c: fields[3],
      option_d: fields[4],
      explanation: fields[5]
    };
  }
}
