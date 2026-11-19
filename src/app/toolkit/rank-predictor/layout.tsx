import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/toolkit/rank-predictor", {
    title: "SSC Rank Predictor & Marks Normalization Calculator 2026 — Answer Key Analysis | SSCZone",
    description:
      "Predict your SSC CGL, CHSL, CPO rank and shift-normalized score from raw marks or official answer key URL. Shift difficulty analysis, category rank, and qualifying percentile.",
    keywords: [
      "SSC Rank Predictor",
      "SSC CGL Rank Predictor 2026",
      "SSC Normalization Marks Calculator",
      "SSC Answer Key Score Calculator",
      "SSC Shift Difficulty Normalizer",
      "SSC Category Rank Predictor",
      "SSC CGL Cutoff Marks Prediction",
      "TCS Shift Wise Score Normalization",
    ],
  });
}

const RANK_PREDICTOR_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SSC Rank Predictor & Marks Normalizer",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All (Web Browser)",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Comprehensive score calculation and rank prediction engine for SSC candidates. Parses official answer keys, analyzes raw scores, shift difficulty, negative markings, and normalized marks.",
  "featureList": [
    "Automatic Answer Key URL parsing for TCS candidate responses",
    "Section-wise raw marks, correct, incorrect, and negative deduction",
    "Shift difficulty normalization estimate",
    "Category-wise and All-India rank practice",
    "Printable scorecard summary"
  ]
};

const RANK_PREDICTOR_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does the SSC normalization formula work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SSC uses a standard statistical normalization formula based on the mean and standard deviation of candidate scores across different shifts. It normalizes differences in shift difficulty by comparing top percentiles and mean performance across shifts."
      }
    },
    {
      "@type": "Question",
      "name": "What is the negative marking penalty in SSC CGL Tier 1?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In SSC CGL Tier 1, each question carries 2 marks and has a negative marking penalty of 0.50 marks (1/4th penalty) for every incorrect answer."
      }
    },
    {
      "@type": "Question",
      "name": "Can I calculate my score using my official answer key link?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Simply paste your official SSC response sheet URL into the Rank Predictor tool to automatically extract your selected answers, correct answer keys, and section-by-section scorecard."
      }
    }
  ]
};

export default function RankPredictorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(RANK_PREDICTOR_APP_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(RANK_PREDICTOR_FAQ_SCHEMA) }}
      />
      {children}
    </>
  );
}
