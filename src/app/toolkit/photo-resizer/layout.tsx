import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/toolkit/photo-resizer", {
    title: "SSC Photo & Signature Resizer Tool (20-50 KB & 10-20 KB) — 100% In-Browser Private | SSCZone",
    description:
      "Free SSC Photo Resizer & Signature Converter. Compress & crop photos to 20-50 KB (3.5×4.5 cm) and signatures to 10-20 KB (4.0×2.0 cm) with zero upload, client-side privacy, and SSC CGL/CHSL form guidelines.",
    keywords: [
      "SSC Photo Resizer",
      "SSC Photo Size 20 to 50 kb",
      "SSC Signature Resizer 10 to 20 kb",
      "SSC Form Photo Compressor",
      "Resize Photo for SSC CGL Online",
      "SSC Photo 3.5 x 4.5 cm",
      "SSC Signature 4 x 2 cm",
      "SSC Photo Resizer Without Loss of Quality",
      "Free Online Image Compressor for SSC",
    ],
  });
}

const PHOTO_RESIZER_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SSC Photo & Signature Resizer Tool",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All (Web Browser)",
  "browserRequirements": "Requires JavaScript. HTML5 Canvas supported.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "In-browser high-precision image compressor and resizer tailored to Staff Selection Commission (SSC) specifications: 3.5×4.5 cm (20-50 KB) for photos and 4.0×2.0 cm (10-20 KB) for signatures.",
  "featureList": [
    "Strict 3.5 x 4.5 cm photo dimension cropping",
    "Strict 4.0 x 2.0 cm signature dimension cropping",
    "Client-side 100% private in-browser compression",
    "Zero upload to external servers",
    "Instant target file size indicator (20-50 KB & 10-20 KB)",
    "One-click direct JPEG download"
  ]
};

const PHOTO_RESIZER_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are the SSC photo dimensions and file size requirements?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "As per SSC notification guidelines, the passport photo must be in JPEG/JPG format, file size between 20 KB and 50 KB, and dimensions of 3.5 cm (width) × 4.5 cm (height) or approximately 350 × 450 pixels."
      }
    },
    {
      "@type": "Question",
      "name": "What are the SSC signature dimensions and file size requirements?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The signature must be in JPEG/JPG format, file size between 10 KB and 20 KB, and dimensions of 4.0 cm (width) × 2.0 cm (height) or approximately 400 × 200 pixels on plain white paper with blue/black ink."
      }
    },
    {
      "@type": "Question",
      "name": "Why do SSC application forms reject photos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Common reasons for rejection include: 1) File size below 20 KB or above 50 KB, 2) Blurred or distorted aspect ratio, 3) Wearing cap, hat, spectacles, or goggles, 4) Not looking straight into the camera with both ears clearly visible, and 5) Dark or patterned background instead of clean light background."
      }
    },
    {
      "@type": "Question",
      "name": "Is my photo safe when using this resizer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, 100% safe. This tool performs all resizing and compression directly inside your web browser using HTML5 Canvas. Your photos and signatures are never sent or saved to any server."
      }
    }
  ]
};

export default function PhotoResizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PHOTO_RESIZER_APP_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PHOTO_RESIZER_FAQ_SCHEMA) }}
      />
      {children}
    </>
  );
}
