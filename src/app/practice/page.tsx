import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/seo-store";
import PracticeDirectoryClient from "./PracticeDirectoryClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/practice", {
    title: "SSC Question Bank 2026 — Chapter-Wise MCQs, Practice Tests & Solutions | SSCZone",
    description: "Practice chapter-wise MCQs for SSC CGL, CHSL, CPO, MTS, Stenographer & Railways. Master Quantitative Aptitude, Reasoning, English, and General Awareness with instant bilingual explanations.",
    keywords: [
      "SSC Question Bank 2026",
      "SSC Chapter Wise MCQs",
      "SSC CGL Practice Questions",
      "SSC Maths Topic Wise Test",
      "SSC Reasoning MCQs with Solutions",
      "SSC English Chapter Practice",
      "Number System SSC Practice",
    ],
  });
}

export const dynamic = "force-dynamic";

export default async function PracticeDirectoryPage() {
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, title, slug, exams(id, title, slug), topics(id, title, slug, is_free, is_active)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const activeSubjects = (subjects || []).map((s: any) => ({
    ...s,
    topics: (s.topics || [])
      .filter((t: any) => t.is_active !== false)
      .sort((a: any, b: any) => a.id - b.id),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "SSC Chapter-Wise Question Bank & Practice Tests",
    "description": "Topic-by-topic online test series and practice MCQs with bilingual solutions for SSC and Railway examinations.",
    "url": "https://ssczone.com/practice",
    "provider": {
      "@type": "Organization",
      "name": "SSCZone",
      "sameAs": "https://ssczone.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PracticeDirectoryClient subjects={activeSubjects} />
    </>
  );
}
