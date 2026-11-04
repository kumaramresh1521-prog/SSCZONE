/**
 * Comprehensive Rank-Math & Yoast Style Real-Time SEO & Keyword Analyzer
 * Built specifically for SSCZone Educational Articles & Exam Blog Posts
 */

export interface SeoTestResult {
  id: string;
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
}

export function cleanText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function analyzeSeo(params: {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  focusKeyword: string;
  imageUrl?: string | null;
}): SeoAuditReport {
  const { title = "", slug = "", content = "", excerpt = "", focusKeyword = "", imageUrl = null } = params;

  const rawText = cleanText(content);
  const wordCount = countWords(rawText);
  const titleTrimmed = title.trim();
  const slugTrimmed = slug.trim().toLowerCase();
  const descTrimmed = excerpt.trim();
  const kw = focusKeyword.trim().toLowerCase();

  const titleLength = titleTrimmed.length;
  const descLength = descTrimmed.length;

  // Calculate read time (avg 200 words per minute)
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  const readTime = `${minutes} min read`;

  const tests: SeoTestResult[] = [];

  // If no focus keyword is provided
  if (!kw) {
    return {
      score: 30,
      rating: "Poor",
      badgeColor: "text-rose-500 bg-rose-50 border-rose-200",
      wordCount,
      readTime,
      keywordDensity: 0,
      keywordCount: 0,
      titleCharCount: titleLength,
      descCharCount: descLength,
      tests: [
        {
          id: "no_keyword",
          label: "Focus Keyword Provided",
          status: "fail",
          score: 0,
          maxScore: 20,
          message: "Please enter a Primary Focus Keyword (e.g. 'SSC CGL 2026 Notification').",
          tip: "Add your main target search query so our algorithm can audit keyword placement.",
        },
      ],
    };
  }

  // Count keyword occurrences in raw text
  let kwCount = 0;
  if (kw && rawText) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = rawText.match(regex);
    kwCount = matches ? matches.length : 0;
  }

  const keywordDensity = wordCount > 0 ? Number(((kwCount / wordCount) * 100).toFixed(2)) : 0;

  // 1. Keyword in Title
  const hasKwInTitle = titleTrimmed.toLowerCase().includes(kw);
  const startsWithKw = titleTrimmed.toLowerCase().startsWith(kw);
  if (hasKwInTitle) {
    tests.push({
      id: "kw_title",
      label: "Keyword in Title",
      status: "pass",
      score: startsWithKw ? 15 : 12,
      maxScore: 15,
      message: startsWithKw
        ? "✓ Great! Focus keyword is right at the beginning of the Title."
        : "✓ Good! Focus keyword is present in the Title.",
    });
  } else {
    tests.push({
      id: "kw_title",
      label: "Keyword in Title",
      status: "fail",
      score: 0,
      maxScore: 15,
      message: `✕ Focus keyword "${focusKeyword}" is missing from the title.`,
      tip: "Include your primary keyword in the article headline for maximum Google CTR.",
    });
  }

  // 2. Title Length (50 - 65 chars ideal)
  if (titleLength >= 45 && titleLength <= 65) {
    tests.push({
      id: "title_length",
      label: "Title Length Optimization",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Perfect Title length (${titleLength} characters). Will not get truncated in Google search.`,
    });
  } else if (titleLength > 65) {
    tests.push({
      id: "title_length",
      label: "Title Length Optimization",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: `⚠ Title is too long (${titleLength}/60 chars). Google may truncate it with "...".`,
      tip: "Try shortening to between 50 and 60 characters for best mobile visibility.",
    });
  } else {
    tests.push({
      id: "title_length",
      label: "Title Length Optimization",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: `⚠ Title is short (${titleLength} chars). Add helpful context like exam year or syllabus guide.`,
    });
  }

  // 3. Keyword in URL Slug
  const cleanKwSlug = kw.replace(/[^a-z0-9]+/g, "-");
  const hasKwInSlug = slugTrimmed.includes(cleanKwSlug) || cleanKwSlug.split("-").every((part) => slugTrimmed.includes(part));
  if (hasKwInSlug) {
    tests.push({
      id: "kw_slug",
      label: "Keyword in URL Slug",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ URL slug contains your focus keyword: /blog/${slugTrimmed}`,
    });
  } else {
    tests.push({
      id: "kw_slug",
      label: "Keyword in URL Slug",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: `✕ Focus keyword is missing from URL Slug.`,
      tip: `Change slug to include "${cleanKwSlug}" for search ranking advantage.`,
    });
  }

  // 4. Keyword in Meta Description (Excerpt)
  const hasKwInDesc = descTrimmed.toLowerCase().includes(kw);
  if (hasKwInDesc) {
    tests.push({
      id: "kw_desc",
      label: "Keyword in Meta Description",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: "✓ Focus keyword appears in the Meta Description / Excerpt.",
    });
  } else {
    tests.push({
      id: "kw_desc",
      label: "Keyword in Meta Description",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "✕ Focus keyword not found in the Meta Description.",
      tip: "Google highlights matching keywords in bold on SERP, boosting candidate click rates.",
    });
  }

  // 5. Meta Description Length (120 - 160 chars)
  if (descLength >= 110 && descLength <= 165) {
    tests.push({
      id: "desc_length",
      label: "Meta Description Length",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Meta description length is optimal (${descLength} characters).`,
    });
  } else if (descLength > 165) {
    tests.push({
      id: "desc_length",
      label: "Meta Description Length",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: `⚠ Description is slightly long (${descLength} characters). Google truncates at ~160.`,
    });
  } else {
    tests.push({
      id: "desc_length",
      label: "Meta Description Length",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: `⚠ Description is short (${descLength} characters). Aim for 120–160 characters.`,
    });
  }

  // 6. Keyword in First 10% of Content (Introduction)
  const first10Percent = rawText.substring(0, Math.max(300, Math.floor(rawText.length * 0.15))).toLowerCase();
  const hasKwInIntro = first10Percent.includes(kw);
  if (hasKwInIntro) {
    tests.push({
      id: "kw_intro",
      label: "Keyword in First Paragraph",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: "✓ Focus keyword appears early in the opening paragraph.",
    });
  } else {
    tests.push({
      id: "kw_intro",
      label: "Keyword in First Paragraph",
      status: "warn",
      score: 3,
      maxScore: 10,
      message: "⚠ Focus keyword is missing from the first paragraph / introduction.",
      tip: "Mention the topic immediately in the opening 2 sentences.",
    });
  }

  // 7. Subheadings (H2 / H3)
  const hasHeadings = /<h[23][^>]*>([\s\S]*?)<\/h[23]>/i.test(content);
  const headingMatches = content.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi) || [];
  const hasKwInHeadings = headingMatches.some((h) => cleanText(h).toLowerCase().includes(kw));

  if (hasKwInHeadings) {
    tests.push({
      id: "kw_headings",
      label: "Keyword in Subheadings (H2/H3)",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Focus keyword appears in ${headingMatches.length} H2/H3 subheadings.`,
    });
  } else if (hasHeadings) {
    tests.push({
      id: "kw_headings",
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
      label: "Keyword in Subheadings (H2/H3)",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "✕ No H2 or H3 subheadings found in the content.",
      tip: "Break your article into structured sections using H2 and H3 headings.",
    });
  }

  // 8. Keyword Density & Frequency
  if (kwCount >= 2 && keywordDensity >= 0.8 && keywordDensity <= 2.5) {
    tests.push({
      id: "kw_density",
      label: "Keyword Density",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Optimal Keyword Density: ${keywordDensity}% (${kwCount} occurrences).`,
    });
  } else if (keywordDensity > 2.5) {
    tests.push({
      id: "kw_density",
      label: "Keyword Density",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: `⚠ Keyword density is high (${keywordDensity}%). Risk of keyword stuffing penalty.`,
      tip: "Reduce repeating the exact keyword; use natural synonyms instead.",
    });
  } else {
    tests.push({
      id: "kw_density",
      label: "Keyword Density",
      status: "warn",
      score: 4,
      maxScore: 10,
      message: `⚠ Keyword density is low (${keywordDensity}% - used ${kwCount} time(s)).`,
      tip: "Aim for 1.0% to 2.0% keyword density across your article.",
    });
  }

  // 9. Article Content Length
  if (wordCount >= 600) {
    tests.push({
      id: "word_count",
      label: "Article Word Count",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `✓ Comprehensive content length: ${wordCount} words (minimum 600 words met).`,
    });
  } else if (wordCount >= 300) {
    tests.push({
      id: "word_count",
      label: "Article Word Count",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: `⚠ Moderate length (${wordCount} words). Comprehensive guides (>600 words) rank higher.`,
    });
  } else {
    tests.push({
      id: "word_count",
      label: "Article Word Count",
      status: "fail",
      score: 2,
      maxScore: 10,
      message: `✕ Content is too thin (${wordCount} words). Minimum 300+ words required.`,
      tip: "Add syllabus details, official table, or FAQs to provide depth.",
    });
  }

  // 10. Featured Image & Media
  const hasImage = Boolean(imageUrl && imageUrl.trim()) || /<img[^>]+>/i.test(content);
  if (hasImage) {
    tests.push({
      id: "has_image",
      label: "Featured Image / Visuals",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: "✓ Featured banner image or media attached (Crucial for Google Discover).",
    });
  } else {
    tests.push({
      id: "has_image",
      label: "Featured Image / Visuals",
      status: "warn",
      score: 0,
      maxScore: 5,
      message: "⚠ No featured image found. Google Discover requires 1200px+ images to feature articles.",
      tip: "Upload a clean banner image to maximize social clicks and Google Discover traffic.",
    });
  }

  // Calculate total score out of 100
  const totalScore = Math.min(
    100,
    Math.round(tests.reduce((acc, t) => acc + t.score, 0))
  );

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
  };
}
