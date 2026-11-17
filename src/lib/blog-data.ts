export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: "Exam Notification" | "Answer Key & Results" | "Preparation Strategy" | "Current Affairs" | "English Language & Grammar" | "General Science & Biology" | string;
  exam_tag?: string;
  read_time: string;
  image_url?: string;
  keywords?: string;
  seo_title?: string;
  is_published: boolean;
  is_featured?: boolean;
  created_at: string;
}

// Clean slate - no sample blogs hardcoded
export const DEFAULT_BLOGS: BlogPost[] = [];
