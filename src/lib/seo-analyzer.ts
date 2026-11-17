/**
 * Comprehensive Rank-Math & Yoast Style Real-Time SEO & Keyword Analyzer
 * Built specifically for SSCZone Educational Articles, PYQs & Exam Blog Posts.
 * Supports Multilingual (English + Hindi Devanagari) keyword analytics.
 */

export interface SecondaryKeywordAudit {
  keyword: string;
  count: number;
  density: number;
  inHeadings: boolean;
  inDesc: boolean;
  status: "pass" | "warn" | "fail";
}

export interface SeoTestResult {
  id: string;
  category: "basic" | "additional" | "title" | "secondary";
  label: string;
  status: "pass" | "warn" | "fail";
  score: number;
  maxScore: number;
  message: string;
  tip?: string;
}

export interface SeoAuditReport {
  score: number; // 0 - 100
  rating: "Poor" | "Needs Improvement" | "Good" | "Excellent";
  badgeColor: string;
  wordCount: number;
  readTime: string;
  keywordDensity: number; // e.g. 1.8%
  keywordCount: number;
  titleCharCount: number;
  descCharCount: number;
  tests: SeoTestResult[];
  secondaryAudits: SecondaryKeywordAudit[];
}

export interface SeoAnalyzeParams {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  focusKeyword: string;
  secondaryKeywords?: string[] | string;
  imageUrl?: string | null;
  canonicalUrl?: string;
}

/**
 * Strips markup, SVG vector internals, scripts & styling to give pure readable text.
 */
export function cleanText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, " ") // Exclude raw vector paths & coordinate data
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes text for robust search matching (removes punctuation, unifies dashes, lowercase)
 */
export function normalizeMatch(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212\uFF0D]/g, "-") // normalize dashes
    .replace(/[^\p{L}\p{N}\s\-]/gu, " ") // remove special punctuation but keep unicode letters
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Accurately counts words across English and Hindi (Devanagari) scripts
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Unicode-safe keyword occurrence counter that works for both English and Hindi
 */
export function countKeywordOccurrences(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const kwNorm = normalizeMatch(keyword);
  if (!kwNorm) return 0;

  const textNorm = normalizeMatch(text);
  const escaped = kwNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  try {
    // Unicode-aware word boundaries
    const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu");
    const matches = textNorm.match(regex);
    if (matches) return matches.length;
  } catch {
    // Fallback for older regex engines
    let count = 0;
    let pos = textNorm.indexOf(kwNorm);
    while (pos !== -1) {
      count++;
      pos = textNorm.indexOf(kwNorm, pos + kwNorm.length);
    }
    return count;
  }

  // Fallback substring search if boundary check was overly strict
  let count = 0;
  let pos = textNorm.indexOf(kwNorm);
  while (pos !== -1) {
    count++;
    pos = textNorm.indexOf(kwNorm, pos + kwNorm.length);
  }
  return count;
}

export function analyzeSeo(params: SeoAnalyzeParams): SeoAuditReport {
  const {
    title = "",
    slug = "",
    content = "",
    excerpt = "",
    focusKeyword = "",
    secondaryKeywords = [],
    imageUrl = null,
  } = params;

  const rawText = cleanText(content);
  const wordCount = countWords(rawText);
  const titleTrimmed = title.trim();
  const slugTrimmed = slug.trim().toLowerCase();
  const descTrimmed = excerpt.trim();
  const kw = focusKeyword.trim();

  const titleLength = titleTrimmed.length;
  const descLength = descTrimmed.length;

  // Read time: avg 180 words per minute for exam notes
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  const readTime = `${minutes} min read`;

  // Parse secondary keywords list
  const secKeywordsList: string[] = (
    Array.isArray(secondaryKeywords)
      ? secondaryKeywords
      : typeof secondaryKeywords === "string"
      ? secondaryKeywords.split(",")
      : []
  )
    .map((k) => k.trim())
    .filter(Boolean);

  const tests: SeoTestResult[] = [];
  const secondaryAudits: SecondaryKeywordAudit[] = [];

  // Parse subheadings from content
  const headingMatches = content.match(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi) || [];
  const headingTexts = headingMatches.map((h) => normalizeMatch(cleanText(h)));

  // If no focus keyword is provided
  if (!kw) {
    return {
      score: 35,
      rating: "Poor",
      badgeColor: "text-rose-600 bg-rose-50 border-rose-200",
      wordCount,
      readTime,
      keywordDensity: 0,
      keywordCount: 0,
      titleCharCount: titleLength,
      descCharCount: descLength,
      tests: [
        {
          id: "no_keyword",
          category: "basic",
          label: "Focus Keyword Provided",
          status: "fail",
          score: 0,
          maxScore: 20,
          message: "Please enter a Primary Focus Keyword (e.g. 'SSC CGL 2026 Notification' or 'Cell Biology').",
          tip: "Add your main target search query so our algorithm can audit keyword placement.",
        },
      ],
      secondaryAudits: [],
    };
  }

  // 1. Primary Keyword Occurrences & Density
  const kwCount = countKeywordOccurrences(rawText, kw);
  const keywordDensity = wordCount > 0 ? Number(((kwCount / wordCount) * 100).toFixed(2)) : 0;

  const kwNorm = normalizeMatch(kw);
  const titleNorm = normalizeMatch(titleTrimmed);
  const descNorm = normalizeMatch(descTrimmed);

  // ── TEST 1: Keyword in Title ──
  const hasKwInTitle = titleNorm.includes(kwNorm);
  const startsWithKw = titleNorm.startsWith(kwNorm);
  if (hasKwInTitle) {
    tests.push({
      id: "kw_title",
      category: "basic",
      label: "Focus Keyword in Title",
      status: "pass",
      score: startsWithKw ? 15 : 12,
      maxScore: 15,
      message: startsWithKw
        ? "✓ Great! Focus keyword appears right at the start of the title."
        : "✓ Good! Focus keyword is present in the title.",
    });
  } else {
    tests.push({
      id: "kw_title",
      category: "basic",
      label: "Focus Keyword in Title",
      status: "fail",
      score: 0,
      maxScore: 15,
      message: `✕ Focus keyword "${kw}" is missing from the title.`,
      tip: "Include your primary keyword in the headline for maximum Google click-through rate.",
    });
  }

  // ── TEST 2: Title Length (Ideal: 40 - 65 chars) ──
  if (titleLength >= 40 && titleLength <= 65) {
    tests.push({
      id: "title_length",
      category: "title",
      label: "Title Length Optimization",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Optimal title length (${titleLength} characters). Won't be truncated in Google search.`,
    });
  } else if (titleLength > 65) {
    tests.push({
      id: "title_length",
      category: "title",
      label: "Title Length Optimization",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: `⚠ Title is long (${titleLength}/60 chars). Google may truncate it with "...".`,
      tip: "Shorten between 45–60 characters for best mobile visibility.",
    });
  } else {
    tests.push({
      id: "title_length",
      category: "title",
      label: "Title Length Optimization",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: `⚠ Title is short (${titleLength} chars). Add helpful context like exam year or shift.`,
    });
  }

  // ── TEST 3: Keyword in URL Slug ──
  const kwSlugParts = kwNorm.replace(/[^a-z0-9]+/gi, "-").split("-").filter(Boolean);
  const cleanSlugNorm = slugTrimmed.replace(/[^a-z0-9]+/gi, "-");
  const hasKwInSlug = kwSlugParts.length > 0 && kwSlugParts.every((p) => cleanSlugNorm.includes(p));

  if (hasKwInSlug || cleanSlugNorm.includes(kwNorm.replace(/\s+/g, "-"))) {
    tests.push({
      id: "kw_slug",
      category: "basic",
      label: "Keyword in URL Slug",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ URL slug contains your focus keyword: /blog/${slugTrimmed}`,
    });
  } else {
    tests.push({
      id: "kw_slug",
      category: "basic",
      label: "Keyword in URL Slug",
      status: "warn",
      score: 3,
      maxScore: 10,
      message: "⚠ Focus keyword terms not fully reflected in URL slug.",
      tip: "Include core keyword terms in the slug for a strong SEO ranking boost.",
    });
  }

  // ── TEST 4: Keyword in Meta Description (Excerpt) ──
  const hasKwInDesc = descNorm.includes(kwNorm);
  if (hasKwInDesc) {
    tests.push({
      id: "kw_desc",
      category: "basic",
      label: "Keyword in Meta Description",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: "✓ Focus keyword appears in the Meta Description / Excerpt.",
    });
  } else {
    tests.push({
      id: "kw_desc",
      category: "basic",
      label: "Keyword in Meta Description",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "✕ Focus keyword not found in the Meta Description.",
      tip: "Google highlights matching keywords in bold on SERP, boosting search clicks.",
    });
  }

  // ── TEST 5: Meta Description Length (Ideal: 110 - 165 chars) ──
  if (descLength >= 110 && descLength <= 165) {
    tests.push({
      id: "desc_length",
      category: "basic",
      label: "Meta Description Length",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Meta description length is optimal (${descLength} characters).`,
    });
  } else if (descLength > 165) {
    tests.push({
      id: "desc_length",
      category: "basic",
      label: "Meta Description Length",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: `⚠ Description is slightly long (${descLength} chars). Google truncates at ~160.`,
    });
  } else {
    tests.push({
      id: "desc_length",
      category: "basic",
      label: "Meta Description Length",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: `⚠ Description is short (${descLength} chars). Aim for 120–160 characters.`,
    });
  }

  // ── TEST 6: Keyword in First 10% / Intro ──
  const firstParagraph = rawText.substring(0, Math.max(400, Math.floor(rawText.length * 0.15)));
  const hasKwInIntro = normalizeMatch(firstParagraph).includes(kwNorm);
  if (hasKwInIntro) {
    tests.push({
      id: "kw_intro",
      category: "additional",
      label: "Keyword in First Paragraph",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: "✓ Focus keyword appears early in the opening section.",
    });
  } else {
    tests.push({
      id: "kw_intro",
      category: "additional",
      label: "Keyword in First Paragraph",
      status: "warn",
      score: 3,
      maxScore: 10,
      message: "⚠ Focus keyword is missing from the first paragraph / introduction.",
      tip: "Mention your target keyword in the opening sentences to establish search intent.",
    });
  }

  // ── TEST 7: Keyword in Subheadings (H2 / H3) ──
  const hasKwInHeadings = headingTexts.some((h) => h.includes(kwNorm));
  if (hasKwInHeadings) {
    tests.push({
      id: "kw_headings",
      category: "additional",
      label: "Keyword in Subheadings (H2/H3)",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Focus keyword appears in subheadings (${headingMatches.length} headings detected).`,
    });
  } else if (headingMatches.length > 0) {
    tests.push({
      id: "kw_headings",
      category: "additional",
      label: "Keyword in Subheadings (H2/H3)",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: "⚠ Subheadings exist, but none contain your focus keyword.",
      tip: "Include your keyword or a variation in at least one H2 heading.",
    });
  } else {
    tests.push({
      id: "kw_headings",
      category: "additional",
      label: "Keyword in Subheadings (H2/H3)",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "✕ No H2 or H3 subheadings found in the content.",
      tip: "Break your article into structured sections using H2 and H3 headings.",
    });
  }

  // ── TEST 8: Keyword Density & Frequency ──
  if (kwCount >= 2 && keywordDensity >= 0.7 && keywordDensity <= 2.8) {
    tests.push({
      id: "kw_density",
      category: "additional",
      label: "Keyword Density",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Optimal Keyword Density: ${keywordDensity}% (${kwCount} occurrences).`,
    });
  } else if (keywordDensity > 2.8) {
    tests.push({
      id: "kw_density",
      category: "additional",
      label: "Keyword Density",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: `⚠ Keyword density is high (${keywordDensity}%). Risk of keyword stuffing.`,
      tip: "Reduce exact keyword repetition; use natural synonyms or related phrases.",
    });
  } else {
    tests.push({
      id: "kw_density",
      category: "additional",
      label: "Keyword Density",
      status: "warn",
      score: kwCount > 0 ? 5 : 2,
      maxScore: 10,
      message: `⚠ Keyword density is ${keywordDensity}% (found ${kwCount} time(s)).`,
      tip: "Aim for 1.0% to 2.0% keyword density across your article.",
    });
  }

  // ── TEST 9: Article Word Count ──
  if (wordCount >= 500) {
    tests.push({
      id: "word_count",
      category: "basic",
      label: "Article Word Count",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Comprehensive content length: ${wordCount} words (minimum 500 words met).`,
    });
  } else if (wordCount >= 250) {
    tests.push({
      id: "word_count",
      category: "basic",
      label: "Article Word Count",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: `⚠ Moderate length (${wordCount} words). Articles with 500+ words rank higher.`,
    });
  } else {
    tests.push({
      id: "word_count",
      category: "basic",
      label: "Article Word Count",
      status: "fail",
      score: 2,
      maxScore: 10,
      message: `✕ Content is thin (${wordCount} words). Minimum 300+ words required.`,
      tip: "Add syllabus details, comparison table, or FAQs to provide depth.",
    });
  }

  // ── TEST 10: Featured Image & Media ──
  const hasImage = Boolean(imageUrl && imageUrl.trim()) || /<img[^>]+>/i.test(content) || /<svg[^>]+>/i.test(content);
  if (hasImage) {
    tests.push({
      id: "has_image",
      category: "additional",
      label: "Featured Image / Visuals",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: "✓ Featured banner image or diagrams attached (Essential for Google Discover).",
    });
  } else {
    tests.push({
      id: "has_image",
      category: "additional",
      label: "Featured Image / Visuals",
      status: "warn",
      score: 0,
      maxScore: 5,
      message: "⚠ No cover image found. Attach an image to maximize Google Discover traffic.",
    });
  }

  // ── AUDIT SECONDARY KEYWORDS ──
  let secondaryBonus = 0;
  if (secKeywordsList.length > 0) {
    let matchedSecondaryCount = 0;

    for (const secKw of secKeywordsList) {
      const secNorm = normalizeMatch(secKw);
      const sCount = countKeywordOccurrences(rawText, secKw);
      const sDensity = wordCount > 0 ? Number(((sCount / wordCount) * 100).toFixed(2)) : 0;
      const inHeadings = headingTexts.some((h) => h.includes(secNorm));
      const inDesc = descNorm.includes(secNorm);

      const isPass = sCount > 0;
      if (isPass) matchedSecondaryCount++;

      secondaryAudits.push({
        keyword: secKw,
        count: sCount,
        density: sDensity,
        inHeadings,
        inDesc,
        status: isPass ? "pass" : "fail",
      });
    }

    if (matchedSecondaryCount > 0) {
      secondaryBonus = Math.min(5, Math.ceil((matchedSecondaryCount / secKeywordsList.length) * 5));
      tests.push({
        id: "secondary_kw",
        category: "secondary",
        label: "Secondary Keywords Integration",
        status: matchedSecondaryCount === secKeywordsList.length ? "pass" : "warn",
        score: secondaryBonus,
        maxScore: 5,
        message: `✓ ${matchedSecondaryCount} of ${secKeywordsList.length} secondary keywords found in article.`,
        tip: "Spread your secondary keywords naturally in subheadings and body paragraphs.",
      });
    } else {
      tests.push({
        id: "secondary_kw",
        category: "secondary",
        label: "Secondary Keywords Integration",
        status: "warn",
        score: 0,
        maxScore: 5,
        message: `⚠ None of your ${secKeywordsList.length} secondary keywords were found in the text.`,
        tip: "Include secondary search terms in your content to capture long-tail candidate searches.",
      });
    }
  }

  // Total Score out of 100
  const baseScore = tests.reduce((acc, t) => acc + t.score, 0);
  const totalScore = Math.min(100, Math.round(baseScore));

  let rating: "Poor" | "Needs Improvement" | "Good" | "Excellent" = "Poor";
  let badgeColor = "text-rose-600 bg-rose-50 border-rose-200";

  if (totalScore >= 80) {
    rating = "Excellent";
    badgeColor = "text-emerald-700 bg-emerald-50 border-emerald-300";
  } else if (totalScore >= 65) {
    rating = "Good";
    badgeColor = "text-blue-700 bg-blue-50 border-blue-200";
  } else if (totalScore >= 45) {
    rating = "Needs Improvement";
    badgeColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  return {
    score: totalScore,
    rating,
    badgeColor,
    wordCount,
    readTime,
    keywordDensity,
    keywordCount: kwCount,
    titleCharCount: titleLength,
    descCharCount: descLength,
    tests,
    secondaryAudits,
  };
}
