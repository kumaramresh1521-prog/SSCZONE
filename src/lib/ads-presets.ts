import { AdSlotConfig } from "./ads-types";

export interface AdPreset {
  id: string;
  name: string;
  description: string;
  category: "mock_test" | "community" | "typing" | "books" | "quiz" | "adsense" | "custom";
  icon: string;
  config: Partial<AdSlotConfig>;
}

export const AD_PRESETS: AdPreset[] = [
  {
    id: "preset_mock_pass",
    name: "🎯 SSC CGL 2026 Test Pass Pro",
    description: "Promote online CBT mock tests with instant rank and solutions",
    category: "mock_test",
    icon: "target",
    config: {
      type: "promo_card",
      promoCard: {
        id: "promo_mock_pass",
        title: "SSC CGL 2026 Full CBT Mock Test Series",
        subtitle: "500+ Full-Length Tests, Sectional Speed Drills & Bilingual Step-by-Step Solutions.",
        badge: "Special 50% Off",
        ctaText: "Attempt Free Test ➔",
        targetUrl: "/mocks",
        theme: "indigo",
        icon: "target",
      },
    },
  },
  {
    id: "preset_telegram",
    name: "📢 Official Telegram Community (45K+)",
    description: "Grow your Telegram channel with daily quizzes & PDF alerts",
    category: "community",
    icon: "telegram",
    config: {
      type: "promo_card",
      promoCard: {
        id: "promo_telegram_group",
        title: "Join 45,000+ SSC Aspirants on Telegram",
        subtitle: "Get daily free quizzes, subject PDF notes, and instant SSC exam updates.",
        badge: "Free Community",
        ctaText: "Join Telegram ➔",
        targetUrl: "https://t.me/ssczone_official",
        theme: "blue",
        icon: "telegram",
      },
    },
  },
  {
    id: "preset_typing",
    name: "⌨️ SSC Typing Speed & Accuracy Test",
    description: "Official 15-min countdown tool for CGL & CHSL typing test",
    category: "typing",
    icon: "keyboard",
    config: {
      type: "promo_card",
      promoCard: {
        id: "promo_typing_tool",
        title: "SSC Typing Practice Tool (Real CBT Interface)",
        subtitle: "Live 15-min countdown, error calculation, key depressions & Net WPM score.",
        badge: "Free Tool",
        ctaText: "Start Typing Test ➔",
        targetUrl: "/typing",
        theme: "emerald",
        icon: "keyboard",
      },
    },
  },
  {
    id: "preset_daily_quiz",
    name: "🏆 Today's Free Daily Rapid Fire Quiz",
    description: "Challenge aspirants with 25 daily fresh TCS PYQs",
    category: "quiz",
    icon: "trophy",
    config: {
      type: "promo_card",
      promoCard: {
        id: "promo_daily_quiz",
        title: "Today's Free 25-Question Daily Rapid Fire Quiz",
        subtitle: "Compete with 20,000+ candidates today and check your All-India Percentile.",
        badge: "Live Challenge",
        ctaText: "Attempt Daily Quiz ➔",
        targetUrl: "/daily-quiz",
        theme: "amber",
        icon: "trophy",
      },
    },
  },
  {
    id: "preset_pinnacle_math",
    name: "📖 Pinnacle SSC Maths 6800+ PYQ Book",
    description: "Amazon affiliate book banner with image and discount badge",
    category: "books",
    icon: "book",
    config: {
      type: "affiliate",
      affiliateBanner: {
        id: "aff_pinnacle_math",
        title: "Pinnacle SSC Maths 6800+ TCS PYQ Book (4th Edition)",
        subtitle: "Complete English & Hindi Chapter-wise Solved Papers with smart short tricks.",
        badge: "Amazon Best Seller",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in/dp/B0CKZ7L9PY?tag=ssczone-21",
        ctaText: "Buy on Amazon ➔",
        relSponsored: true,
      },
    },
  },
  {
    id: "preset_neetu_english",
    name: "📕 Neetu Singh English Vol 1 Grammar",
    description: "Essential grammar reference book for SSC CGL & CHSL",
    category: "books",
    icon: "book",
    config: {
      type: "affiliate",
      affiliateBanner: {
        id: "aff_neetu_english",
        title: "English for General Competitions - Neetu Singh Vol 1",
        subtitle: "Official 2026 Edition for CGL/CHSL Aspirants. Rules & Practice Exercises.",
        badge: "Flat 28% Off",
        imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in?tag=ssczone-21",
        ctaText: "Get Best Price ➔",
        relSponsored: true,
      },
    },
  },
  {
    id: "preset_blackbook_vocab",
    name: "📗 BlackBook of English Vocabulary",
    description: "Topper recommended book for One Word, Idioms & Antonyms",
    category: "books",
    icon: "book",
    config: {
      type: "affiliate",
      affiliateBanner: {
        id: "aff_blackbook_vocab",
        title: "BlackBook of English Vocabulary (Updated 2026 Edition)",
        subtitle: "All One Word Substitutions, Idioms, Synonyms & Antonyms asked by TCS.",
        badge: "Vocabulary Bible",
        imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
        targetUrl: "https://www.amazon.in?tag=ssczone-21",
        ctaText: "Buy on Amazon ➔",
        relSponsored: true,
      },
    },
  },
  {
    id: "preset_adsense_responsive",
    name: "💰 Google AdSense Responsive Unit",
    description: "Standard Google AdSense auto-responsive ad block",
    category: "adsense",
    icon: "code",
    config: {
      type: "adsense",
      adsenseSlotId: "1234567890",
    },
  },
  {
    id: "preset_custom_html",
    name: "⚡ Custom Script / HTML Embed",
    description: "Raw HTML, third party script tags, or custom interactive widget",
    category: "custom",
    icon: "sparkles",
    config: {
      type: "html",
      customHtml: `<div class="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center shadow-md">
  <h4 class="text-sm font-black">SSC CGL 2026 Notification Released!</h4>
  <p class="text-xs text-blue-100 mt-1">Check vacancy breakdown, eligibility & syllabus details.</p>
  <a href="/exams/ssc-cgl" class="inline-block mt-3 px-4 py-1.5 bg-white text-blue-800 rounded-xl font-bold text-xs shadow-xs hover:bg-blue-50">View Details ➔</a>
</div>`,
    },
  },
];
