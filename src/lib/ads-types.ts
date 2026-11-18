export type AdType = "adsense" | "affiliate" | "html";

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

export interface AdSlotConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: AdType;
  adsenseSlotId?: string;
  affiliateBanner?: AffiliateBannerConfig;
  customHtml?: string;
}

export interface SiteAdsConfig {
  enabledGlobally: boolean;
  publisherId: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  autoAdsEnabled: boolean;
  slots: Record<string, AdSlotConfig>;
  updatedAt?: string;
}

export const DEFAULT_ADS_CONFIG: SiteAdsConfig = {
  enabledGlobally: false,
  publisherId: "",
  autoAdsEnabled: false,
  slots: {
    headerLeaderboard: {
      id: "headerLeaderboard",
      name: "Top Header Leaderboard",
      description: "Shown on top of study & chapter pages",
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
      name: "In-Practice Solution Footer",
      description: "Appears right below step-by-step solution card",
      enabled: true,
      type: "affiliate",
      adsenseSlotId: "2345678901",
      affiliateBanner: {
        id: "aff_pinnacle_math",
        title: "Pinnacle SSC Maths 6800+ TCS PYQ Book",
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
      name: "Desktop Sidebar Sticky Ad",
      description: "Sticky vertical ad banner on desktop study pages",
      enabled: false,
      type: "adsense",
      adsenseSlotId: "4567890123",
      affiliateBanner: {
        id: "aff_sidebar_default",
        title: "BlackBook of English Vocabulary",
        subtitle: "All One Word, Idioms & Antonyms",
        badge: "Exam Essential",
        imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in?tag=ssczone-21",
        ctaText: "Get 35% Off ➔",
        relSponsored: true,
      },
    },
    footerBanner: {
      id: "footerBanner",
      name: "Question Solver Bottom Banner",
      description: "Clean banner above discussion & next question buttons",
      enabled: true,
      type: "affiliate",
      adsenseSlotId: "5678901234",
      affiliateBanner: {
        id: "aff_neetu_vol1",
        title: "English for General Competitions - Neetu Singh Vol 1",
        subtitle: "Official 2026 Edition for CGL/CHSL Aspirants",
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
