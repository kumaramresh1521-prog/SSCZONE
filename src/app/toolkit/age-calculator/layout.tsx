import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/toolkit/age-calculator", {
    title: "SSC Age Calculator & Eligibility Checker — Official Cutoff Dates & Category Relaxation | SSCZone",
    description:
      "Calculate your exact age in years, months, and days as on official SSC cutoff dates (01-08-2025 / 01-01-2025). Check age eligibility with UR, OBC (+3y), SC/ST (+5y), and PwD (+10y) relaxations for CGL, CHSL, CPO, MTS.",
    keywords: [
      "SSC Age Calculator",
      "SSC Cutoff Date Age Calculator",
      "SSC CGL Age Limit Calculator",
      "SSC Age Relaxation OBC SC ST",
      "SSC CHSL Eligibility Age",
      "SSC CPO Age Criteria 2026",
      "Calculate Age as on 01-08-2025",
      "SSC Form Age Eligibility Check",
    ],
  });
}

const AGE_CALCULATOR_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SSC Age Eligibility Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All (Web Browser)",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "High-accuracy candidate age calculator designed for official Staff Selection Commission (SSC) exams including CGL, CHSL, CPO, and MTS. Calculates exact years, months, and days relative to official notification cutoff dates.",
  "featureList": [
    "Exact Age in Years, Months, and Days as of Cutoff Date",
    "Notification-aligned cutoff dates (01-08-2025, 01-01-2025, custom)",
    "Category age relaxations: UR (0y), OBC (+3y), SC/ST (+5y), PwD (+10y to +15y)",
    "Post-wise eligibility check for 18-27y, 18-30y, and 18-32y cadres",
    "Instant Pass/Fail qualification status badge"
  ]
};

const AGE_CALCULATOR_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the crucial cutoff date for SSC CGL 2025-2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For SSC exams with exam tiers held in the second half of the year, the crucial cutoff date is typically 1st August of the exam year (e.g., 01-08-2025 or 01-08-2026). For exams held in the first half, it is usually 1st January."
      }
    },
    {
      "@type": "Question",
      "name": "What is the age relaxation for OBC candidates in SSC exams?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Non-Creamy Layer OBC candidates receive 3 years of upper age relaxation beyond the general category limit for the post applied."
      }
    },
    {
      "@type": "Question",
      "name": "What is the age relaxation for SC and ST candidates in SSC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SC and ST candidates receive 5 years of upper age relaxation across all SSC exam posts."
      }
    },
    {
      "@type": "Question",
      "name": "What are the common age brackets for SSC CGL posts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SSC CGL posts broadly fall into three age brackets: 18 to 27 years (e.g., Auditor, Accountant, Tax Assistant), 18 to 30 years (e.g., ASO in CSS, Inspector of Income Tax, Central Excise), and up to 32 years (Junior Statistical Officer - JSO)."
      }
    }
  ]
};

export default function AgeCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(AGE_CALCULATOR_APP_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(AGE_CALCULATOR_FAQ_SCHEMA) }}
      />
      {children}
    </>
  );
}
