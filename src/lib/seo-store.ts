import fs from "fs";
import path from "path";
import type { Metadata } from "next";

export interface SeoConfigData {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  canonicalUrl: string;
  author: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    imageUrl: string;
    type: string;
  };
  twitter: {
    card: string;
    site: string;
    creator: string;
  };
  indexing: {
    index: boolean;
    follow: boolean;
    maxSnippet: number;
    maxImagePreview: string;
    maxVideoPreview: number;
  };
  verification: {
    google: string;
    bing: string;
    googleAnalyticsId: string;
    adsenseId: string;
  };
  pageOverrides: Record<string, { title: string; description: string }>;
  updatedAt?: string;
}

export const DEFAULT_SEO_CONFIG: SeoConfigData = {
  siteTitle: "SSCZone — Official SSC Syllabus-Wise MCQ Practice & Test Series Portal",
  titleTemplate: "%s | SSCZone",
  metaDescription: "Prepare for SSC CGL, CHSL, CPO, MTS, GD, Steno & Railways Exams topic-by-topic. Practice high-quality MCQs from standard reference books with instant bilingual solutions.",
  canonicalUrl: "https://ssczone.com",
  author: "SSCZone Editorial Team",
  keywords: [
    "SSC CGL Practice",
    "SSC CHSL Test Series",
    "SSC CPO MCQs",
    "Syllabus Wise MCQ",
    "SSC Exam Test Series",
    "Previous Year Papers",
    "SSC PYQ Test 2026"
  ],
  openGraph: {
    title: "SSCZone — Syllabus-Wise SSC MCQ Practice & Test Series Portal",
    description: "Crack SSC CGL, CHSL, CPO, MTS & Railways Exams with chapter-by-chapter MCQ practice and previous year test series.",
    imageUrl: "https://ssczone.com/icon-512.png",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: "@ssczone",
    creator: "@ssczone"
  },
  indexing: {
    index: true,
    follow: true,
    maxSnippet: -1,
    maxImagePreview: "large",
    maxVideoPreview: -1
  },
  verification: {
    google: "",
    bing: "",
    googleAnalyticsId: "",
    adsenseId: ""
  },
  pageOverrides: {
    "/papers": {
      title: "SSC PYQ Shift Papers 2026 Live — Download PDF & Attempt CBT Test",
      description: "Download clean official SSC CGL, CHSL, CPO shift paper PDFs with SSC Zone branding and attempt online CBT mock tests with instant scorecards."
    }
  }
};

const SEO_FILE_PATH = path.join(process.cwd(), "src", "data", "seo-config.json");

/**
 * Synchronous reader for Server Components and SSR metadata generation
 */
export function getPublishedSeoConfig(): SeoConfigData {
  try {
    if (fs.existsSync(SEO_FILE_PATH)) {
      const content = fs.readFileSync(SEO_FILE_PATH, "utf8");
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_SEO_CONFIG,
        ...parsed,
        openGraph: { ...DEFAULT_SEO_CONFIG.openGraph, ...(parsed.openGraph || {}) },
        twitter: { ...DEFAULT_SEO_CONFIG.twitter, ...(parsed.twitter || {}) },
        indexing: { ...DEFAULT_SEO_CONFIG.indexing, ...(parsed.indexing || {}) },
        verification: { ...DEFAULT_SEO_CONFIG.verification, ...(parsed.verification || {}) },
        pageOverrides: { ...DEFAULT_SEO_CONFIG.pageOverrides, ...(parsed.pageOverrides || {}) },
      };
    }
  } catch (err) {
    console.error("Error reading SEO config file:", err);
  }
  return DEFAULT_SEO_CONFIG;
}

/**
 * Asynchronous reader that checks Supabase first, falls back to local JSON
 */
export async function getPublishedSeoConfigAsync(): Promise<SeoConfigData> {
  try {
    // Attempt Supabase fetch if available
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "seo_config")
      .maybeSingle();

    if (!error && data?.value) {
      const parsed = data.value as Partial<SeoConfigData>;
      return {
        ...DEFAULT_SEO_CONFIG,
        ...parsed,
        openGraph: { ...DEFAULT_SEO_CONFIG.openGraph, ...(parsed.openGraph || {}) },
        twitter: { ...DEFAULT_SEO_CONFIG.twitter, ...(parsed.twitter || {}) },
        indexing: { ...DEFAULT_SEO_CONFIG.indexing, ...(parsed.indexing || {}) },
        verification: { ...DEFAULT_SEO_CONFIG.verification, ...(parsed.verification || {}) },
        pageOverrides: { ...DEFAULT_SEO_CONFIG.pageOverrides, ...(parsed.pageOverrides || {}) },
      };
    }
  } catch {
    // If Supabase table isn't created or DB call fails, safely continue
  }

  return getPublishedSeoConfig();
}

/**
 * Helper to build dynamic page-level Next.js Metadata.
 * Supports:
 *  1. Admin page overrides (e.g. override for "/papers", "/exams", "/" etc.)
 *  2. Global site title & description updates from Admin SEO panel
 *  3. Dynamic OpenGraph, Twitter Cards, Keywords & Googlebot Indexing
 */
export async function buildPageMetadata(
  pathname: string,
  defaults?: {
    title?: string;
    description?: string;
    keywords?: string[];
    imageUrl?: string;
  }
): Promise<Metadata> {
  const seo = await getPublishedSeoConfigAsync();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const override = seo.pageOverrides?.[normalizedPath];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || seo.canonicalUrl || "https://ssczone.com";
  const canonicalUrl = `${baseUrl.replace(/\/$/, "")}${normalizedPath === "/" ? "" : normalizedPath}`;

  // Title calculation:
  // 1. Page override title (if set by admin)
  // 2. If homepage ("/" or "") -> seo.siteTitle
  // 3. defaults.title
  // 4. Default site title
  let finalTitle: string;
  if (override?.title && override.title.trim().length > 0) {
    finalTitle = override.title.trim();
  } else if (normalizedPath === "/") {
    finalTitle = seo.siteTitle;
  } else if (defaults?.title) {
    finalTitle = defaults.title;
  } else {
    finalTitle = seo.siteTitle;
  }

  // Strip duplicate branding suffix if not on homepage, because layout.tsx applies titleTemplate (%s | SSCZone)
  if (normalizedPath !== "/") {
    finalTitle = finalTitle.replace(/\s*(\||\-)\s*SSCZONE?\s*$/i, "").trim();
  }

  // Description calculation:
  let finalDescription: string;
  if (override?.description && override.description.trim().length > 0) {
    finalDescription = override.description.trim();
  } else if (normalizedPath === "/") {
    finalDescription = seo.metaDescription;
  } else if (defaults?.description) {
    finalDescription = defaults.description;
  } else {
    finalDescription = seo.metaDescription;
  }

  // Keywords calculation
  const keywordsSet = new Set<string>([
    ...(defaults?.keywords || []),
    ...(seo.keywords || []),
  ]);
  const finalKeywords = Array.from(keywordsSet);

  const ogImage = defaults?.imageUrl || seo.openGraph?.imageUrl || "/icon-512.png";

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords,
    authors: [{ name: seo.author }],
    creator: seo.author,
    publisher: "SSCZone",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: canonicalUrl,
      siteName: "SSCZone",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: (seo.twitter?.card as any) || "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      site: seo.twitter?.site || "@ssczone",
      creator: seo.twitter?.creator || "@ssczone",
      images: [ogImage],
    },
    robots: {
      index: seo.indexing?.index ?? true,
      follow: seo.indexing?.follow ?? true,
      googleBot: {
        index: seo.indexing?.index ?? true,
        follow: seo.indexing?.follow ?? true,
        "max-video-preview": seo.indexing?.maxVideoPreview ?? -1,
        "max-image-preview": (seo.indexing?.maxImagePreview as any) || "large",
        "max-snippet": seo.indexing?.maxSnippet ?? -1,
      },
    },
  };
}
