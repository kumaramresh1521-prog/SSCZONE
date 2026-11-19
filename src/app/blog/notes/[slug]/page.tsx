import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import {
  getChapterNotesAsync,
  getChapterNoteBySlugAsync,
  ALL_SUBJECTS,
} from "@/lib/chapter-notes-store";
import ChapterNotesReaderClient from "../ChapterNotesReaderClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

export const revalidate = 300; // 5-minute ISR cache to prevent high-frequency database egress

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true" || searchParams.preview === "admin";
  const note = await getChapterNoteBySlugAsync(params.slug);

  if (!note || (!note.is_active && !isPreview)) {
    return { title: "Chapter Note Not Found - SSCZone" };
  }

  const title = (note as any).seo_title || `${note.title} ${note.hindi_title ? `(${note.hindi_title})` : ""} - ${note.subject_name} Notes | SSCZone`;
  const desc =
    (note as any).seo_description ||
    note.excerpt ||
    note.content.replace(/<[^>]*>?/gm, "").substring(0, 160) + "...";
  // Canonical points to the Master Blog Article to prevent duplicate content
  const canonicalUrl = `https://ssczone.com/blog/${note.slug}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title,
      description: desc,
      url: canonicalUrl,
      siteName: "SSCZone",
      type: "article",
      images: [{ url: "https://ssczone.com/icon-512.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

export default async function ChapterNoteDetailPage(props: Props) {
  const params = await props.params;
  const slug = params?.slug;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true" || searchParams.preview === "admin";
  const note = await getChapterNoteBySlugAsync(slug);

  if (!note || (!note.is_active && !isPreview)) {
    notFound();
  }

  const allNotes = await getChapterNotesAsync(isPreview ? { active_only: false } : { active_only: true });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${note.title} ${note.hindi_title ? `(${note.hindi_title})` : ""} - ${note.subject_name}`,
    description: note.excerpt || note.title,
    keywords: ((note as any).keywords || [
      "SSC CGL Biology Notes",
      "Cell: The Unit of Life Notes",
      "कोशिका विज्ञान नोट्स",
      "General Science PCB SSC"
    ]).join(", "),
    inLanguage: ["en", "hi"],
    datePublished: note.created_at,
    dateModified: note.updated_at || note.created_at,
    author: {
      "@type": "Organization",
      name: "SSCZone Editorial Desk",
      url: "https://ssczone.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SSCZone",
      logo: {
        "@type": "ImageObject",
        url: "https://ssczone.com/icon-512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ssczone.com/blog/notes/${note.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssczone.com" },
      { "@type": "ListItem", position: 2, name: "Chapter Notes", item: "https://ssczone.com/blog/notes" },
      { "@type": "ListItem", position: 3, name: note.title, item: `https://ssczone.com/blog/notes/${note.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ChapterNotesReaderClient
        initialNotes={allNotes.map((n) => (n.slug === note.slug ? note : n))}
        subjects={ALL_SUBJECTS}
        defaultSlug={note.slug}
      />
    </>
  );
}
