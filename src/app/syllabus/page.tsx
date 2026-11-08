import type { Metadata } from "next";
import SyllabusTrackerClient from "./SyllabusTrackerClient";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/syllabus", {
    title: "SSC CGL 2026 Syllabus Tracker & OneNote Checklist | SSCZone",
    description:
      "Interactive, notification-mapped chapter checklist for SSC CGL 2026, CHSL, CPO, MTS & GD. Track 3-Pillar progress: Theory, 50+ PYQ drills & 3x revisions with personal formula scratchpads.",
    keywords: [
      "SSC CGL Syllabus 2026",
      "SSC CGL Chapter Wise Checklist",
      "SSC Syllabus Tracker",
      "SSC CHSL 2026 Syllabus",
      "SSC Maths Syllabus PDF",
      "SSC Reasoning Topics Checklist",
      "SSC English Syllabus Tracker",
      "SSC OneNote Revision Tracker",
    ],
  });
}

export const dynamic = "force-dynamic";

export default async function SyllabusPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "SSC CGL 2026 Interactive Syllabus Tracker & Revision Notebook",
    "description":
      "Comprehensive, chapter-wise checklist for SSC CGL 2026, CHSL, CPO, MTS & GD with 3-Pillar tracking (Theory, 50+ PYQs, 3x Revisions).",
    "provider": {
      "@type": "Organization",
      "name": "SSCZone",
      "sameAs": "https://ssczone.in",
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SyllabusTrackerClient />
    </>
  );
}
