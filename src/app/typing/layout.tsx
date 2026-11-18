import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/typing", {
    title: "SSC 2000 Key Depressions Typing Test Simulator — TCS Exam Hall Interface | SSCZone",
    description:
      "Practice official SSC 2000 Key Depressions DEST typing test passages with 15-minute countdown, backspace controls, gross/net WPM, accuracy, and TCS error percentage calculator for CGL Tier 2 & CHSL.",
    keywords: [
      "SSC 2000 Key Depressions",
      "SSC Typing Test TCS Interface",
      "SSC CGL DEST Simulator",
      "SSC Typing Test 15 Minutes",
      "SSC Typing Error Percentage Calculator",
      "SSC CHSL Typing Speed Online",
      "TCS Pattern Typing Simulator",
      "Full and Half Error Calculator SSC",
    ],
  });
}

const TYPING_TEST_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SSC 2000 Key Depressions Typing Test Simulator",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All (Web Browser)",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Authentic TCS examination hall typing test interface for SSC CGL Tier 2, CHSL, and Steno candidates. Simulates 2000 key depressions in 15 minutes with exact TCS error evaluation rules.",
  "featureList": [
    "2000 Key Depressions in 15 Minutes countdown timer",
    "Exact TCS split-screen passage display",
    "Gross WPM, Net WPM, and Real-time Keystrokes counter",
    "Full Error (omission, substitution, addition) detection",
    "Half Error (spacing, punctuation, capitalization) detection",
    "Official qualifying status (5% UR, 7% OBC/EWS/SC/ST cutoff)"
  ]
};

const TYPING_TEST_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the speed requirement for the SSC CGL DEST typing test?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The SSC CGL Data Entry Skill Test (DEST) requires candidates to type 2,000 key depressions within 15 minutes, which corresponds to approximately 27 words per minute (WPM) based on 5 keystrokes per word."
      }
    },
    {
      "@type": "Question",
      "name": "What is the maximum allowed error percentage in SSC CGL typing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The maximum permissible error limit is 5% for General (UR) category candidates, and 7% for OBC, EWS, SC, ST, and PwD candidates. For higher-tier posts like Tax Assistant, stringent cutoffs apply."
      }
    },
    {
      "@type": "Question",
      "name": "Is backspace allowed in the official SSC typing test?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, backspace and arrow navigation are allowed within the typed text area during the official SSC typing examination."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between Full Error and Half Error in SSC typing evaluation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Full Errors include complete word omission, substitution of a word, or addition of an extra word not present in the master text. Half Errors include spelling errors, capitalization mistakes, incorrect spacing (no space between words or unwanted space within a word), and punctuation inaccuracies."
      }
    }
  ]
};

export default function TypingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TYPING_TEST_APP_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TYPING_TEST_FAQ_SCHEMA) }}
      />
      {children}
    </>
  );
}
