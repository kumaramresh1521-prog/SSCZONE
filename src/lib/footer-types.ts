export interface FooterLink {
  label: string;
  href: string;
  is_external?: boolean;
  badge?: string;
  is_highlight?: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  id: string;
  platform: "telegram" | "youtube" | "whatsapp" | "twitter" | "instagram" | "email";
  label: string;
  url: string;
  is_active: boolean;
}

export interface FooterConfig {
  brandDescription: string;
  brandSubText: string;
  columns: FooterColumn[];
  socialLinks: FooterSocialLink[];
  copyrightText: string;
  legalLinks: { label: string; href: string }[];
  updatedAt?: string;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brandDescription:
    "Syllabus-wise MCQ practice and previous year test series portal for SSC CGL, CHSL, CPO, MTS, and Railways examinations.",
  brandSubText:
    "Curated practice questions aligned with latest Staff Selection Commission exam patterns.",
  copyrightText: "SSCZone. All rights reserved.",
  columns: [
    {
      id: "practice",
      title: "Practice",
      links: [
        { label: "Syllabus Questions", href: "/exams" },
        { label: "Previous Year Papers", href: "/papers", badge: "2026" },
        { label: "Mock Test Series", href: "/mocks" },
        { label: "Typing Test", href: "/typing" },
        { label: "Speed Tests", href: "/speed-test" },
      ],
    },
    {
      id: "exams",
      title: "Target Exams",
      links: [
        { label: "SSC CGL (Tier 1 & 2)", href: "/exams/ssc-cgl" },
        { label: "SSC CHSL (10+2)", href: "/exams/ssc-chsl" },
        { label: "SSC CPO (SI)", href: "/exams/ssc-cpo" },
        { label: "SSC MTS & Havaldar", href: "/exams/ssc-mts" },
        { label: "SSC GD Constable", href: "/exams/ssc-gd" },
      ],
    },
    {
      id: "resources",
      title: "Resources & Tools",
      links: [
        { label: "Exam Blog & Updates 📰", href: "/blog", is_highlight: true },
        { label: "Recommended Books 📚", href: "/books", is_highlight: true },
        { label: "Free Subject Notes PDF", href: "/notes" },
        { label: "Chapter Revision Notes", href: "/blog/notes" },
        { label: "Rank Predictor Tool", href: "/toolkit/rank-predictor" },
        { label: "Age Calculator", href: "/toolkit/age-calculator" },
        { label: "Photo & Sign Resizer", href: "/toolkit/photo-resizer" },
        { label: "About Us", href: "/about" },
        { label: "Contact Support", href: "/contact" },
      ],
    },
  ],
  socialLinks: [
    {
      id: "telegram",
      platform: "telegram",
      label: "Join Telegram Community",
      url: "https://t.me/ssczone",
      is_active: true,
    },
    {
      id: "youtube",
      platform: "youtube",
      label: "YouTube Channel",
      url: "https://youtube.com/@ssczone",
      is_active: true,
    },
    {
      id: "whatsapp",
      platform: "whatsapp",
      label: "WhatsApp Support & Alerts",
      url: "https://wa.me/910000000000",
      is_active: true,
    },
    {
      id: "twitter",
      platform: "twitter",
      label: "X (Twitter)",
      url: "https://twitter.com/ssczone",
      is_active: false,
    },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
};
