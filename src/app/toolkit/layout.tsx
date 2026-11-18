import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/toolkit", {
    title: "SSC Candidate Toolkit & Free Exam Utilities Hub 2026 | SSCZone",
    description:
      "Free high-precision candidate utilities for SSC CGL, CHSL, CPO, MTS & GD aspirants. Photo & Signature Resizer (20-50 KB), Age Eligibility Calculator with Cutoff Dates, Rank Predictor, and TCS 2000 Key Depressions Typing Simulator.",
    keywords: [
      "SSC Candidate Toolkit",
      "SSC Exam Utilities Hub",
      "SSC Photo Resizer 20 to 50 kb",
      "SSC Signature Resizer 10 to 20 kb",
      "SSC Age Calculator Cutoff Date",
      "SSC Rank Predictor 2026",
      "SSC Typing Test TCS 2000 Key Depressions",
      "Free SSC Tools for Aspirants",
      "SSC CGL Application Tools",
    ],
  });
}

const TOOLKIT_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What candidate utility tools are available on SSCZone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SSCZone provides free online utilities built specifically for SSC CGL, CHSL, CPO, MTS, and GD candidates: 1) SSC Photo & Signature Resizer (20-50 KB photo, 10-20 KB signature with exact cm dimensions), 2) SSC Age Eligibility Calculator with category relaxations and official cutoff dates, 3) SSC Rank Predictor & Marks Normalizer, 4) TCS 2000 Key Depressions Typing Test Simulator, and 5) Master Syllabus Tracker."
      }
    },
    {
      "@type": "Question",
      "name": "Are SSCZone candidate tools 100% free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all SSCZone candidate utilities are completely free, require zero login or registration, and produce instant results."
      }
    },
    {
      "@type": "Question",
      "name": "Is my photo and signature uploaded to your server when using the Photo Resizer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The SSC Photo & Signature Resizer operates 100% in-browser using HTML5 Canvas API. Your photos and signatures never leave your device and are never uploaded to any external server, ensuring complete data privacy."
      }
    },
    {
      "@type": "Question",
      "name": "Does the typing simulator adhere to the official TCS DEST exam pattern?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, the typing simulator features the exact split-screen TCS exam hall layout, 15-minute countdown timer, 2000 key depressions tracking, restricted backspace controls, and official full/half error percentage calculation."
      }
    }
  ]
};

const TOOLKIT_COLLECTION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "SSC Candidate Utilities & Toolkit Hub",
  "description": "Comprehensive suite of free candidate tools for SSC examination aspirants.",
  "url": "https://ssczone.com/toolkit",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "SSC Master Syllabus Tracker & OneNote Checklist",
        "url": "https://ssczone.com/syllabus"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "SSC Rank Predictor & Marks Calculator",
        "url": "https://ssczone.com/toolkit/rank-predictor"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "SSC Photo & Signature Resizer Tool (20-50 KB & 10-20 KB)",
        "url": "https://ssczone.com/toolkit/photo-resizer"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "SSC Typing Test 2000 Key Depressions TCS Simulator",
        "url": "https://ssczone.com/typing"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "SSC Eligibility Age Calculator with Cutoff Dates",
        "url": "https://ssczone.com/toolkit/age-calculator"
      }
    ]
  }
};

export default function ToolkitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TOOLKIT_COLLECTION_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TOOLKIT_FAQ_SCHEMA) }}
      />
      {children}
    </>
  );
}
