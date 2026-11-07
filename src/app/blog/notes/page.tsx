import type { Metadata } from "next";
import { getChapterNotes, ALL_SUBJECTS } from "@/lib/chapter-notes-store";
import ChapterNotesReaderClient from "./ChapterNotesReaderClient";
import { buildPageMetadata } from "@/lib/seo-store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/blog/notes", {
    title: "SSC Chapter-Wise Subject Notes & Theory | Physics, Polity, Maths - SSCZone",
    description:
      "Interactive chapter-wise study notes for SSC CGL, CHSL, CPO & MTS. Master Physics, Chemistry, Indian Polity, History, Geography, and Maths formulas with bilingual chapter notes.",
    keywords: [
      "SSC Physics Notes Chapter wise",
      "SSC CGL Polity Notes",
      "SSC Maths Formula Notes",
      "SSC Chapter wise Theory",
      "SSC General Science Notes",
      "SSC CGL 2026 Study Material",
    ],
  });
}

export default async function ChapterNotesPage() {
  const notes = getChapterNotes({ active_only: true });

  const structuredSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "SSC CGL 2026 Chapter-Wise Subject Theory & Notes",
    description: "Curated chapter-by-chapter theory, formulas, and high-yield revision notes for SSC exams.",
    provider: {
      "@type": "Organization",
      name: "SSCZone",
      sameAs: "https://ssczone.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
      />
      <ChapterNotesReaderClient initialNotes={notes} subjects={ALL_SUBJECTS} />
    </>
  );
}
