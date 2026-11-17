export interface SampleChapter {
  title: string;
  pages: string;
  highYield?: boolean;
}

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
