import fs from "fs";
import path from "path";

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

const DEFAULT_SEO_CONFIG: SeoConfigData = {
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
    "SSC PYQ Test 2025"
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
      "title": "SSC PYQ Shift Papers 2026 Live — Download PDF & Attempt CBT Test",
      "description": "Download clean official SSC CGL, CHSL, CPO shift paper PDFs with SSC Zone branding and attempt online CBT mock tests with instant scorecards."
    }
  }
};

export function getPublishedSeoConfig(): SeoConfigData {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "seo-config.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return { ...DEFAULT_SEO_CONFIG, ...JSON.parse(content) };
    }
  } catch (err) {
    // Return fallback defaults safely
  }
  return DEFAULT_SEO_CONFIG;
}
