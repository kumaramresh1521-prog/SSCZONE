import type { Metadata } from "next";
import NotesClient from "./NotesClient";
import { getSubjectNotes } from "@/lib/subject-notes-store";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/notes", {
    title: "SSC Subject Notes & Formula Sheets | High-Yield Revision PDFs - SSCZone",
    description: "Download free chapter-wise revision notes, formula sheets, and study materials for SSC CGL 2026, CHSL, CPO, MTS & GD. Master Maths, Reasoning, English & GS with curated PDFs.",
    keywords: [
      "SSC CGL Notes PDF",
      "SSC Maths Formula Sheet",
      "SSC English Grammar Rules PDF",
      "SSC Reasoning Notes",
      "SSC GS Revision Capsule",
      "SSC CGL 2026 Study Material",
    ],
  });
}

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = getSubjectNotes(true);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "SSC CGL 2026 Master Subject Notes & Study Materials",
    "description": "Comprehensive revision notes, formula cheat sheets, and chapter PDFs for SSC examinations.",
    "provider": {
      "@type": "Organization",
      "name": "SSCZone",
      "sameAs": "https://ssczone.in",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotesClient initialNotes={notes} />
    </>
  );
}
