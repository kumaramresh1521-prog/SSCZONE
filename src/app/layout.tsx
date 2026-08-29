import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ssczone.com"),
  title: {
    default: "SSCZone — Syllabus-Wise MCQ Practice & Test Series Portal",
    template: "%s | SSCZone"
  },
  description: "Prepare for SSC CGL, CHSL, CPO, MTS, GD, Steno & Railways Exams topic-by-topic. Practice high-quality MCQs from standard reference books with instant solutions.",
  keywords: [
    "SSC CGL Practice",
    "SSC CHSL Test Series",
    "SSC CPO MCQs",
    "Syllabus Wise MCQ",
    "SSC Exam Test Series",
    "Previous Year Papers",
    "SSC PYQ Test"
  ],
  authors: [{ name: "SSCZone Team" }],
  creator: "SSCZone",
  publisher: "SSCZone",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icon-192.png" }]
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ssczone.com",
    title: "SSCZone — Official SSC Syllabus-Wise MCQ Practice Portal",
    description: "Crack SSC CGL, CHSL, CPO, MTS & Railways Exams with chapter-by-chapter MCQ practice and previous year test series.",
    siteName: "SSCZone"
  },
  twitter: {
    card: "summary_large_image",
    title: "SSCZone — SSC Syllabus-Wise MCQ Practice Portal",
    description: "Prepare for SSC CGL, CHSL, CPO, MTS, GD & Railways Exams topic-by-topic."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import MainLayoutWrapper from "@/components/MainLayoutWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://ssczone.com/#organization",
        "name": "SSCZone",
        "url": "https://ssczone.com",
        "logo": "https://ssczone.com/icon-512.png",
        "description": "India's #1 Syllabus-Wise SSC Exam Practice & Test Series Portal for SSC CGL, CHSL, CPO, MTS & Railways.",
        "sameAs": ["https://t.me/ssczone"]
      },
      {
        "@type": "WebSite",
        "@id": "https://ssczone.com/#website",
        "url": "https://ssczone.com",
        "name": "SSCZone",
        "publisher": { "@id": "https://ssczone.com/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://ssczone.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </body>
    </html>
  );
}


