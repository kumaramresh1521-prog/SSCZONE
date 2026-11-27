export type AdType = "adsense" | "affiliate" | "promo_card" | "html";

export interface AffiliateBannerConfig {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string; // e.g. "FLAT 40% OFF" or "BEST SELLER"
  imageUrl: string;
  targetUrl: string;
  ctaText: string;
  relSponsored?: boolean;
}

export interface PromoCardConfig {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  targetUrl: string;
  theme?: "indigo" | "emerald" | "amber" | "rose" | "blue" | "dark";
  icon?: "sparkles" | "book" | "telegram" | "keyboard" | "trophy" | "flame" | "target";
}

export interface AdSlotConfig {
  id: string;
  name: string;
  category?: "question_bank" | "blog" | "notes" | "global" | "custom";
  description: string;
  enabled: boolean;
  type: AdType;
  pagePath?: string; // optional route matching e.g. "/practice/*", "/blog/*", or "*"
  adsenseSlotId?: string;
  affiliateBanner?: AffiliateBannerConfig;
  promoCard?: PromoCardConfig;
  customHtml?: string;
}

export interface SiteAdsConfig {
  enabledGlobally: boolean;
  publisherId: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  autoAdsEnabled: boolean;
  inlineInterval?: number; // interval for inline ads, default 5 (every 5th question/card)
  slots: Record<string, AdSlotConfig>;
  updatedAt?: string;
}

export const DEFAULT_ADS_CONFIG: SiteAdsConfig = {
  enabledGlobally: true,
  publisherId: "",
  autoAdsEnabled: false,
  inlineInterval: 5,
  slots: {
    // ── Question Bank Slots ──
    qb_solution: {
      id: "qb_solution",
      name: "Question Bank: Inside Explanation Box",
      category: "question_bank",
      description: "Appears directly inside the question's step-by-step solution card (e.g. recommended book or test pass)",
      enabled: true,
      type: "affiliate",
      affiliateBanner: {
        id: "aff_solution_book",
        title: "SSC 6800+ PYQ Chapter-Wise Solved Book",
        subtitle: "Recommended reference guide with bilingual detailed solutions & short tricks.",
        badge: "Topper Recommended",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in/dp/B0CKZ7L9PY?tag=ssczone-21",
        ctaText: "Get 35% Off on Amazon ➔",
        relSponsored: true,
      },
    },
    qb_inline: {
      id: "qb_inline",
      name: "Question Bank: In-Feed Ad (Between Questions)",
      category: "question_bank",
      description: "Appears seamlessly inside question feed every 5 questions",
      enabled: true,
      type: "promo_card",
      promoCard: {
        id: "promo_mock_pass",
        title: "SSC CGL 2026 VIP Mock Test Series (Tier 1 & 2)",
        subtitle: "500+ Full CBT Mock Tests, Instant All-India Rank & Bilingual Video Explanations.",
        badge: "Most Popular",
        ctaText: "Attempt Free Mock ➔",
        targetUrl: "/mocks",
        theme: "indigo",
        icon: "target",
      },
    },
    qb_top: {
      id: "qb_top",
      name: "Question Bank: Top Banner",
      category: "question_bank",
      description: "Header banner above the question practice workspace",
      enabled: true,
      type: "promo_card",
      promoCard: {
        id: "promo_telegram_qb",
        title: "Join 45,000+ SSC Aspirants on SSCZone Telegram",
        subtitle: "Get daily free quiz questions, subject PDF notes & instant SSC result notifications.",
        badge: "Free Community",
        ctaText: "Join Telegram ➔",
        targetUrl: "https://t.me/ssczone_official",
        theme: "blue",
        icon: "telegram",
      },
    },
    qb_bottom: {
      id: "qb_bottom",
      name: "Question Bank: Bottom Footer Banner",
      category: "question_bank",
      description: "Appears below the questions list and answer palette",
      enabled: true,
      type: "affiliate",
      affiliateBanner: {
        id: "aff_pinnacle_math",
        title: "SSC Maths 6800+ PYQ Practice Book (Latest Edition)",
        subtitle: "Complete English & Hindi Chapter-wise Solved Papers with smart short tricks.",
        badge: "Amazon Best Seller",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in/dp/B0CKZ7L9PY?tag=ssczone-21",
        ctaText: "Get 35% Off on Amazon ➔",
        relSponsored: true,
      },
    },
    qb_sidebar: {
      id: "qb_sidebar",
      name: "Question Bank: Desktop Sidebar Sticky",
      category: "question_bank",
      description: "Sticky vertical ad in the question practice desktop sidebar",
      enabled: false,
      type: "promo_card",
      promoCard: {
        id: "promo_typing_side",
        title: "SSC Typing Practice Tool",
        subtitle: "15-Min Exam Countdown with real-time Gross WPM and Error Calculator.",
        badge: "Free Tool",
        ctaText: "Start Typing ➔",
        targetUrl: "/typing",
        theme: "emerald",
        icon: "keyboard",
      },
    },

    // ── Blog Slots ──
    blog_mid: {
      id: "blog_mid",
      name: "Blog: Mid-Article Ad (Between Paragraphs)",
      category: "blog",
      description: "Injected dynamically in the middle of blog article reading",
      enabled: true,
      type: "promo_card",
      promoCard: {
        id: "promo_blog_study",
        title: "Study with Interactive Split-Screen Reader",
        subtitle: "Read bilingual Hindi-English definitions, diagrams, and formula cheat sheets.",
        badge: "Topper Tool",
        ctaText: "Open Chapter Reader ➔",
        targetUrl: "/blog/notes",
        theme: "indigo",
        icon: "book",
      },
    },
    blog_top: {
      id: "blog_top",
      name: "Blog: Top Header Banner",
      category: "blog",
      description: "Appears right below article title and publish date",
      enabled: false,
      type: "adsense",
      adsenseSlotId: "1234567890",
    },
    blog_bottom: {
      id: "blog_bottom",
      name: "Blog: Post-Article Footer Ad",
      category: "blog",
      description: "Appears after reading the blog post before comments",
      enabled: true,
      type: "affiliate",
      affiliateBanner: {
        id: "aff_neetu_english",
        title: "English for General Competitions - Neetu Singh Vol 1",
        subtitle: "Updated 2026 Edition for CGL/CHSL Aspirants. Rules & Practice Exercises.",
        badge: "Must-Have Grammar",
        imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in?tag=ssczone-21",
        ctaText: "Buy on Amazon ➔",
        relSponsored: true,
      },
    },

    // ── Subject Notes Slots ──
    notes_top: {
      id: "notes_top",
      name: "Subject Notes: Header Banner",
      category: "notes",
      description: "Top banner across subject notes and PDF download directory",
      enabled: true,
      type: "promo_card",
      promoCard: {
        id: "promo_notes_daily",
        title: "Today's Free Daily Rapid Fire GK Quiz",
        subtitle: "Test yourself with 25 fresh SSC PYQs and get instant All-India rank.",
        badge: "Daily Free",
        ctaText: "Start Daily Quiz ➔",
        targetUrl: "/daily-quiz",
        theme: "amber",
        icon: "trophy",
      },
    },
    notes_mid: {
      id: "notes_mid",
      name: "Subject Notes: Mid-Reader Banner",
      category: "notes",
      description: "Appears inside chapter notes between theory sections",
      enabled: true,
      type: "promo_card",
      promoCard: {
        id: "promo_notes_practice",
        title: "Practice Chapter-Wise MCQs on SSCZone",
        subtitle: "Over 30,000+ SSC Previous Year Questions with bilingual step-by-step solutions.",
        badge: "30,000+ MCQs",
        ctaText: "Practice Topic Now ➔",
        targetUrl: "/practice",
        theme: "emerald",
        icon: "sparkles",
      },
    },
    notes_bottom: {
      id: "notes_bottom",
      name: "Subject Notes: Bottom Banner",
      category: "notes",
      description: "Bottom banner at the end of subject notes",
      enabled: true,
      type: "affiliate",
      affiliateBanner: {
        id: "aff_blackbook_vocab",
        title: "BlackBook of English Vocabulary (Updated 2026)",
        subtitle: "All One Word Substitutions, Idioms, Synonyms & Antonyms from previous SSC shifts.",
        badge: "Vocabulary Bible",
        imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in?tag=ssczone-21",
        ctaText: "Check Best Price ➔",
        relSponsored: true,
      },
    },

    // ── Global Slots ──
    global_top_bar: {
      id: "global_top_bar",
      name: "Global: Top Header Announcement Bar",
      category: "global",
      description: "Slim dismissible announcement banner at very top of website",
      enabled: false,
      type: "promo_card",
      promoCard: {
        id: "promo_global_top",
        title: "🎉 SSC CGL 2026 Free All-India Live Mock Test is Now Live!",
        subtitle: "Attempt now and benchmark your score against 35,000+ toppers.",
        badge: "Live Mock",
        ctaText: "Attempt Now ➔",
        targetUrl: "/mocks",
        theme: "indigo",
        icon: "flame",
      },
    },
    global_bottom_bar: {
      id: "global_bottom_bar",
      name: "Global: Floating Bottom Promo Bar",
      category: "global",
      description: "Floating action bar at bottom of mobile & desktop screens",
      enabled: false,
      type: "promo_card",
      promoCard: {
        id: "promo_global_bottom",
        title: "Join SSCZone Telegram for Free SSC Notes & Quiz",
        subtitle: "Over 45,000+ SSC aspirants studying together.",
        badge: "Free Community",
        ctaText: "Join Telegram ➔",
        targetUrl: "https://t.me/ssczone_official",
        theme: "blue",
        icon: "telegram",
      },
    },

    // ── Legacy Slots (Backward Compatibility) ──
    headerLeaderboard: {
      id: "headerLeaderboard",
      name: "Legacy: Header Leaderboard",
      category: "global",
      description: "Legacy top header leaderboard banner",
      enabled: true,
      type: "affiliate",
      adsenseSlotId: "1234567890",
      affiliateBanner: {
        id: "aff_testbook_pass",
        title: "SSC CGL 2026 Test Pass Pro",
        subtitle: "700+ Full-Length Mock Tests & Live Sectional Rank",
        badge: "Special 50% Off",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://testbook.com?coupon=SSCZONEOFF",
        ctaText: "Enroll at Discount ➔",
        relSponsored: true,
      },
    },
    inDrillSolution: {
      id: "inDrillSolution",
      name: "Legacy: In-Practice Solution Footer",
      category: "question_bank",
      description: "Appears right below step-by-step solution card",
      enabled: true,
      type: "affiliate",
      adsenseSlotId: "2345678901",
      affiliateBanner: {
        id: "aff_pinnacle_math",
        title: "Pinnacle SSC Maths 6800+ PYQ Book",
        subtitle: "Complete English & Hindi Chapter-wise Solved Papers",
        badge: "Topper Recommended",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in/dp/B0CKZ7L9PY?tag=ssczone-21",
        ctaText: "Buy on Amazon ➔",
        relSponsored: true,
      },
    },
    sidebarBanner: {
      id: "sidebarBanner",
      name: "Legacy: Desktop Sidebar Sticky Ad",
      category: "global",
      description: "Sticky vertical ad banner on desktop study pages",
      enabled: false,
      type: "adsense",
      adsenseSlotId: "4567890123",
    },
    footerBanner: {
      id: "footerBanner",
      name: "Legacy: Question Solver Bottom Banner",
      category: "global",
      description: "Clean banner above discussion & next question buttons",
      enabled: true,
      type: "affiliate",
      affiliateBanner: {
        id: "aff_neetu_vol1",
        title: "English for General Competitions - Neetu Singh Vol 1",
        subtitle: "Latest 2026 Edition for CGL/CHSL Aspirants",
        badge: "Flat 28% Off",
        imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in?tag=ssczone-21",
        ctaText: "Check Best Price ➔",
        relSponsored: true,
      },
    },
  },
  updatedAt: new Date().toISOString(),
};
