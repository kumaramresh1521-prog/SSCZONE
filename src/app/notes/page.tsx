import type { Metadata } from "next";
import NotesClient from "./NotesClient";
import { DEFAULT_SUBJECTS_DATA } from "@/lib/notes-data";

export const metadata: Metadata = {
  title: "SSC Subject Notes & Formula Sheets | High-Yield Revision Capsules - SSCZone",
  description: "Free comprehensive subject-wise revision notes for SSC CGL, CHSL, CPO, and MTS. Master Units & Dimensions, Newton's Laws, Optics, Acids & Bases, Fundamental Rights, and Indian Rivers with TCS exam traps.",
  keywords: [
    "SSC CGL Notes",
    "SSC CHSL Physics Notes",
    "SSC Polity Fundamental Rights",
    "SSC Chemistry Formulas",
    "TCS Traps SSC GK",
    "SSC GS Revision Capsule",
  ],
  openGraph: {
    title: "SSC Subject Notes & Formula Sheets - SSCZone",
    description: "High-yield theory capsules, comparison tables, TCS exam traps, and chapter-wise MCQs for SSC aspirants.",
    type: "website",
  },
};

export const revalidate = 60; // ISR 1 minute

export default async function NotesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "SSC General Awareness & GS Master Study Notes",
    "description": "Comprehensive revision notes, comparison cheat sheets, and TCS traps for SSC CGL, CHSL, CPO, MTS exams.",
    "provider": {
      "@type": "Organization",
      "name": "SSCZone",
      "sameAs": "https://ssczone.in",
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": "PT20H",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotesClient initialSubjects={DEFAULT_SUBJECTS_DATA} />
    </>
  );
}
