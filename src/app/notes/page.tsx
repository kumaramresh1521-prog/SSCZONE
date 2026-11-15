import type { Metadata } from "next";
import NotesClient from "./NotesClient";
import { getSubjectNotes } from "@/lib/subject-notes-store";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/notes", {
    title: "SSC English Notes PDF & Formula Sheets | 120 Rules, Vocab & Grammar - SSCZone",
    description: "Download 16+ free chapter-wise English revision notes for SSC CGL 2026, CHSL, CPO, MTS & GD. 120 Rules of Grammar, Fixed Prepositions, Idioms & Phrases, One Word Substitution & Tenses PDFs.",
    keywords: [
      "SSC CGL English Notes PDF",
      "120 Rules of Grammar PDF SSC",
      "SSC Fixed Prepositions PDF",
      "SSC Idioms and Phrases PDF",
      "SSC One Word Substitution PDF",
      "SSC English Grammar Rules in Hindi",
      "SSC CGL 2026 English Study Material",
      "Active Passive Voice Rules PDF SSC",
      "Tenses Chart for SSC CGL",
      "SSC English Short Notes Download",
      "SSC Maths Formula Sheet",
      "SSC GS Revision Capsule",
    ],
  });
}

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = getSubjectNotes(true);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "SSC CGL 2026 Master Subject Notes & English Revision PDFs",
    "description": "Comprehensive revision notes, 120 rules of grammar, vocabulary compendiums, and chapter PDFs for SSC examinations.",
    "url": "https://ssczone.com/notes",
    "provider": {
      "@type": "Organization",
      "name": "SSCZone",
      "sameAs": "https://ssczone.com",
    },
    "hasPart": notes.map((n, idx) => ({
      "@type": "DigitalDocument",
      "position": idx + 1,
      "name": n.title,
      "alternateName": n.hindi_title,
      "description": n.description,
      "url": n.pdf_url,
      "fileFormat": "application/pdf",
      "educationalLevel": "Competitive Exams (SSC CGL, CHSL, CPO, MTS)",
      "isAccessibleForFree": true,
    })),
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
