export interface SampleChapter {
  title: string;
  pages: string;
  highYield?: boolean;
}

export interface BooksFreeNoteItem {
  id: string;
  title: string;
  subject: string;
  href: string;
  pages?: string;
  size?: string;
  badge?: string;
  is_active?: boolean;
}

export interface BooksFreeNotesSectionConfig {
  title: string;
  description: string;
  exploreAllHref: string;
  exploreAllLabel: string;
  notes: BooksFreeNoteItem[];
}

export const DEFAULT_FREE_NOTES_CONFIG: BooksFreeNotesSectionConfig = {
  title: "Free Revision Notes",
  description: "Structured chapter summaries and formulas available to study online.",
  exploreAllHref: "/notes",
  exploreAllLabel: "Explore All Notes",
  notes: [
    {
      id: "note-1",
      title: "Advance Maths: 120 Essential Formulas & Theorems Sheet",
      subject: "Maths",
      href: "/notes",
      pages: "18 Pages",
      size: "3.8 MB",
      badge: "PDF",
      is_active: true,
    },
    {
      id: "note-2",
      title: "English: 1000 Most Repeated One Word Substitutions & Idioms",
      subject: "English",
      href: "/notes",
      pages: "24 Pages",
      size: "2.9 MB",
      badge: "PDF",
      is_active: true,
    },
    {
      id: "note-3",
      title: "Static GK: 50 High-Frequency Tables (Dances, Articles, Gharanas)",
      subject: "General Awareness",
      href: "/blog/notes",
      pages: "32 Pages",
      size: "4.5 MB",
      badge: "PDF",
      is_active: true,
    },
    {
      id: "note-4",
      title: "Reasoning: Non-Verbal & Missing Number Logic Formulas",
      subject: "Reasoning",
      href: "/notes",
      pages: "14 Pages",
      size: "2.4 MB",
      badge: "PDF",
      is_active: true,
    },
  ],
};

export interface BookItem {
  id: string;
  title: string;
  hindiTitle?: string;
  author: string;
  publisher: string;
  edition: string;
  subject: "Quantitative Aptitude" | "English Language" | "Reasoning Ability" | "General Awareness" | "PYQ Compilations";
  exams: string[];
  language: "Bilingual" | "English" | "Hindi";
  pages: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  coverImage?: string;
  coverColor: string;
  description: string;
  topperNote?: string;
  freePdfAvailable: boolean;
  pdfUrl?: string;
  buyUrl?: string;
  sampleChapters: SampleChapter[];
  practiceTopicSlug?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}
