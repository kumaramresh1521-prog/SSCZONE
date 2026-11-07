import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import {
  getChapterNotes,
  getChapterNoteBySlug,
  ALL_SUBJECTS,
} from "@/lib/chapter-notes-store";
import ChapterNotesReaderClient from "../ChapterNotesReaderClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const note = getChapterNoteBySlug(params.slug);

  if (!note || !note.is_active) {
    return { title: "Chapter Note Not Found - SSCZone" };
  }

  const title = `${note.title} ${note.hindi_title ? `(${note.hindi_title})` : ""} - ${note.subject_name} Notes | SSCZone`;
  const desc =
    note.excerpt ||
    note.content.replace(/<[^>]*>?/gm, "").substring(0, 160) + "...";
  const canonicalUrl = `https://ssczone.com/blog/notes/${note.slug}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
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
  const note = getChapterNoteBySlug(params.slug);

  if (!note || !note.is_active) {
    notFound();
  }

  const allActiveNotes = getChapterNotes({ active_only: true });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    description: note.excerpt || note.title,
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
        initialNotes={allActiveNotes}
        subjects={ALL_SUBJECTS}
        defaultSlug={note.slug}
      />
    </>
  );
}
