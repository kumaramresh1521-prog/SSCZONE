import type { Metadata } from "next";
import { resolveAssetUrl } from "./utils";

export function slugifyText(text: string, maxLength: number = 60): string {
  if (!text) return "";
  let clean = text
    .replace(/^DIRECTIONS:[^\n]*\n+/i, "")
    .replace(/^PASSAGE:[\s\S]*?\n\nQUESTION:\s*/i, "")
    .replace(/^QUESTION:\s*/i, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength).replace(/-[^-]*$/, "");
  }
  return clean || "question";
}

export function parseQuestionSlug(param: string): { id: number; slug: string } {
  const match = param.match(/^(\d+)(?:-(.*))?$/);
  if (!match) {
    const numeric = parseInt(param, 10);
    return { id: isNaN(numeric) ? 0 : numeric, slug: "" };
  }
  return { id: parseInt(match[1], 10), slug: match[2] || "" };
}

export function getQuestionCanonicalPath(id: number, text?: string): string {
  const slug = text ? slugifyText(text) : "";
  return slug ? `/question/${id}-${slug}` : `/question/${id}`;
}

export function extractCleanQuestionPrompt(fullText: string): string {
  if (!fullText) return "";
  const qMatch = fullText.match(/(?:QUESTION|Q)\s*:\s*([\s\S]+)$/i);
  if (qMatch) {
    return qMatch[1].trim();
  }
  return fullText.replace(/^DIRECTIONS:[\s\S]*?\n\n/i, "").trim();
}

export function cleanExamTag(tag?: string | null): string {
  if (!tag) return "";
  let clean = tag.trim();
  // Strip outer wrapping brackets if entire string is wrapped: e.g. (SSC ...) -> SSC ...
  while (clean.startsWith("(") && clean.endsWith(")")) {
    clean = clean.substring(1, clean.length - 1).trim();
  }
  return clean;
}

export function buildQuestionMetadata(question: any, fullUrl: string, topicTitle?: string, examTitle?: string): Metadata {
  const rawPrompt = extractCleanQuestionPrompt(question.question_text || "");
  const cleanPrompt = (rawPrompt.replace(/\s+/g, " ").trim()) || (question.image_url ? `Figure Question #${question.id}` : `SSC Question #${question.id}`);
  
  const pyqTag = cleanExamTag(question.exam_tag);

  let titleString: string;
  let description: string;

  if (pyqTag) {
    titleString = `${cleanPrompt.slice(0, 55)}... — ${pyqTag} Solution | SSCZone`;
    description = `Official PYQ [${pyqTag}]: Read verified answer and step-by-step explanation for: "${cleanPrompt.slice(0, 130)}...". Practice thousands of SSC previous year questions online on SSCZone.`;
  } else {
    const contextName = topicTitle ? `${topicTitle} - ${examTitle || "SSC"}` : "SSC Question";
    titleString = `${cleanPrompt.slice(0, 70)}... — ${contextName} Solution | SSCZone`;
    description = `Read verified answer and detailed explanation for: "${cleanPrompt.slice(0, 140)}...". Practice thousands of syllabus-wise SSC MCQs online for free on SSCZone.`;
  }

  const resolvedImg = question.image_url ? resolveAssetUrl(question.image_url) : null;
  const ogImages = resolvedImg
    ? [{ url: resolvedImg, width: 800, height: 600, alt: titleString }]
    : [{ url: "https://ssczone.com/icon-512.png", width: 512, height: 512, alt: "SSCZone" }];

  return {
    title: {
      absolute: titleString,
    },
    description,
    keywords: pyqTag
      ? [pyqTag, "SSC PYQ", "Previous Year Question", topicTitle || "SSC Exam", "Answer Key", "SSC Solution", "SSCZone"]
      : [topicTitle || "SSC Exam", examTitle || "SSC", "Question and Answer", "SSC Mock Test", "SSC Practice", "SSCZone"],
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: titleString,
      description,
      url: fullUrl,
      type: "article",
      siteName: "SSCZone",
      images: ogImages,
    },
    twitter: {
      card: resolvedImg ? "summary_large_image" : "summary",
      title: titleString,
      description,
      images: resolvedImg ? [resolvedImg] : ["https://ssczone.com/icon-512.png"],
    },
  };
}

export function generateQuestionJsonLd(question: any, fullUrl: string, topicTitle?: string, examTitle?: string) {
  const rawPrompt = extractCleanQuestionPrompt(question.question_text || "");
  const cleanPrompt = (rawPrompt.replace(/\s+/g, " ").trim()) || (question.image_url ? `Figure Question #${question.id}` : `SSC Question #${question.id}`);
  const explanation = question.explanation || `Option (${question.correct_answer}) is the correct answer.`;
  const pyqTag = cleanExamTag(question.exam_tag);

  const optionsMap: Record<string, string> = {
    A: question.option_a || "",
    B: question.option_b || "",
    C: question.option_c || "",
    D: question.option_d || "",
  };

  const correctLetter = (question.correct_answer || "A").toUpperCase();
  const correctText = optionsMap[correctLetter] || "";
  const resolvedQuestionImg = question.image_url ? resolveAssetUrl(question.image_url) : null;
  const correctOptImg = question[`option_${correctLetter.toLowerCase()}_image_url`];
  const resolvedCorrectOptImg = correctOptImg ? resolveAssetUrl(correctOptImg) : null;

  const pageName = pyqTag 
    ? `${cleanPrompt} — ${pyqTag} Solution`
    : `${cleanPrompt} — ${topicTitle || "SSC Exam"} Solution`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "QAPage",
        "@id": `${fullUrl}#qapage`,
        "url": fullUrl,
        "name": pageName,
        "mainEntity": {
          "@type": "Question",
          "name": cleanPrompt,
          "text": question.question_text || "Solve the figure pattern in the question image.",
          "answerCount": 4,
          "upvoteCount": 24,
          ...(resolvedQuestionImg ? { "image": [resolvedQuestionImg] } : {}),
          "suggestedAnswer": Object.entries(optionsMap).map(([key, val]) => {
            const optImg = question[`option_${key.toLowerCase()}_image_url`];
            const resolvedOptImg = optImg ? resolveAssetUrl(optImg) : null;
            return {
              "@type": "Answer",
              "text": `(${key}) ${val || "Figure"}`,
              "upvoteCount": key === correctLetter ? 24 : 0,
              ...(resolvedOptImg ? { "image": [resolvedOptImg] } : {}),
            };
          }),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Correct Answer: (${correctLetter}) ${correctText || "Correct Figure"}\n\nExplanation: ${explanation}`,
            "upvoteCount": 48,
            ...(resolvedCorrectOptImg ? { "image": [resolvedCorrectOptImg] } : {}),
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${fullUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://ssczone.com",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": examTitle || "SSC Exams",
            "item": "https://ssczone.com/exams",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": pyqTag ? `${pyqTag} (Official PYQ)` : (topicTitle || "Practice"),
            "item": pyqTag ? "https://ssczone.com/papers" : `https://ssczone.com/practice/${question.topic_id}`,
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": `Question #${question.id}`,
            "item": fullUrl,
          },
        ],
      },
    ],
  };
}
