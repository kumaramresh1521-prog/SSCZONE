export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gradient: string[];
  actionType: string;
}

export interface CountdownConfig {
  enabled: boolean;
  examSlug: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  badge: string;
  actionType: string;
}

export interface AdminNotificationItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  group: "Today" | "Earlier";
  unread?: boolean;
  actionType:
    | "papers"
    | "daily_quiz"
    | "syllabus"
    | "notes"
    | "question_bank"
    | "speed_test"
    | "saved_vault"
    | "progress"
    | "url";
  actionUrl?: string;
  active: boolean;
  createdAt?: string;
}

export interface NotificationsFeedConfig {
  enabled: boolean;
  screenTitle: string;
  screenSubtitle: string;
  todayHeading: string;
  earlierHeading: string;
  showBroadcastItem: boolean;
  showDailyQuizItem: boolean;
  showStreakItem: boolean;
  showLatestPapers: boolean;
  latestPapersLimit: number;
  items: AdminNotificationItem[];
}

export type HomeSectionId =
  | "continue"
  | "today"
  | "week"
  | "study_modules"
  | "pyq_years";

export interface HomeSectionConfig {
  id: HomeSectionId;
  title: string;
  visible: boolean;
}

export interface HomeLayoutConfig {
  enabled: boolean;
  showHomeBanners: boolean;
  featuredPaperId: number;
  sections: HomeSectionConfig[];
  moduleBadges: {
    papers?: string;
    syllabus?: string;
    notes?: string;
    questionBank?: string;
    dailyQuiz?: string;
    speedTest?: string;
  };
}

export interface ToolSwitchesConfig {
  enabled: boolean; // master gate; while false, app behavior stays unchanged
  speedTestEnabled: boolean;
  questionBankEnabled: boolean;
  offlineDownloadEnabled: boolean;
  aiTranslationEnabled: boolean;
}

export interface RemoteSyllabusAddedChapter {
  id: string;
  subjectId: "quant" | "reasoning" | "english" | "ga" | "computer";
  category: string;
  name: string;
  hindi_name: string;
  high_weightage?: boolean;
  expected_questions?: string;
  notes_slug?: string;
  default_tips?: string;
}

export interface ExamSyllabusOverride {
  hiddenChapterIds: string[];
  highWeightageIds: string[];
  addedChapters: RemoteSyllabusAddedChapter[];
}

export interface SyllabusSyncConfig {
  enabled: boolean;
  overrides: Record<string, ExamSyllabusOverride>;
}

export interface TelemetryConfig {
  enabled: boolean; // while false, mobile app sends 0 heartbeat pings
}

export interface AdsControlConfig {
  enabled: boolean; // master gate; while false, 0 ads/promos appear on mobile
  syncFromWebAds: boolean;
  showInHome: boolean;
  showInQuestionBank: boolean;
  showAfterResult: boolean;
  inlineInterval: number;
  customPromo: {
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
    targetUrl: string;
  };
}

export interface PackagesControlConfig {
  enabled: boolean; // master gate; while false, all unlocked as before
  paywallMode: "banner_only" | "lock_premium_papers";
  freePapersLimit: number;
  upgradeTitle: string;
  upgradeSubtitle: string;
  upgradeUrl: string;
}

export type CustomStudyModuleColor =
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "teal"
  | "yellow"
  | "pink";

export type CustomStudyModuleIcon =
  | "book"
  | "zap"
  | "target"
  | "file"
  | "clock"
  | "bookmark"
  | "globe";

export type CustomStudyModuleActionType =
  | "papers"
  | "syllabus"
  | "notes"
  | "question_bank"
  | "daily_quiz"
  | "speed_test"
  | "saved_vault"
  | "progress"
  | "cbt_subject"
  | "note_web"
  | "url";

export interface CustomStudyModuleItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: CustomStudyModuleIcon;
  color: CustomStudyModuleColor;
  layout: "half" | "wide";
  actionType: CustomStudyModuleActionType;
  actionTarget?: string;
  visible: boolean;
}

export interface CustomStudyModulesConfig {
  enabled: boolean; // master gate; while false, mobile Study Modules stays unchanged
  items: CustomStudyModuleItem[];
}

export interface MobileAppConfig {
  announcement: {
    enabled: boolean;
    id: string;
    badge: string;
    title: string;
    message: string;
    imageUrl?: string;
    buttonText: string;
    actionType: string;
    actionTarget?: string;
  };
  version: {
    latestVersion: string;
    minRequiredVersion: string;
    forceUpdate: boolean;
    downloadUrl: string;
    releaseNotes: string;
  };
  homeBanners: BannerItem[];
  tickerText: string;
  features: {
    dailyQuizEnabled: boolean;
    syllabusTrackerEnabled: boolean;
    papersEnabled: boolean;
    notesEnabled: boolean;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  featuredPaperId: number;
  countdown: CountdownConfig;
  notificationsFeed: NotificationsFeedConfig;
  homeLayout: HomeLayoutConfig;
  customStudyModules: CustomStudyModulesConfig;
  toolSwitches: ToolSwitchesConfig;
  syllabusSync: SyllabusSyncConfig;
  telemetry: TelemetryConfig;
  adsControl: AdsControlConfig;
  packagesControl: PackagesControlConfig;
  updatedAt?: string;
}

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  { id: "continue", title: "Continue where you left off", visible: true },
  { id: "today", title: "Today's Activity", visible: true },
  { id: "week", title: "This week", visible: true },
  { id: "study_modules", title: "Study Modules", visible: true },
  { id: "pyq_years", title: "PYQ by Year", visible: true },
];

export const DEFAULT_MOBILE_APP_CONFIG: MobileAppConfig = {
  announcement: {
    enabled: false,
    id: "ann_default",
    badge: "🚨 SSC CGL 2026",
    title: "Daily Free Quizzes & PYQs Live!",
    message: "Practice with 125 real previous year papers and interactive syllabus tracker.",
    buttonText: "Solve Free Quiz →",
    actionType: "daily_quiz",
  },
  version: {
    latestVersion: "1.1.0",
    minRequiredVersion: "1.0.0",
    forceUpdate: false,
    downloadUrl: "https://ssczone.com/download-app",
    releaseNotes: "Performance improvements and math typography rendering upgrades.",
  },
  homeBanners: [],
  tickerText: "🎯 SSC CGL 2026 Mock Tests & 125 Shift Papers with Detailed Solutions are Live!",
  features: {
    dailyQuizEnabled: true,
    syllabusTrackerEnabled: true,
    papersEnabled: true,
    notesEnabled: true,
    maintenanceMode: false,
    maintenanceMessage:
      "SSCZone servers are briefly under scheduled maintenance. Please check back shortly.",
  },
  featuredPaperId: 0,
  countdown: {
    enabled: false,
    examSlug: "all",
    title: "SSC CGL Tier-1 Countdown",
    targetDate: "2026-09-15",
    badge: "EXAM ALERT",
    actionType: "papers",
  },
  notificationsFeed: {
    enabled: false,
    screenTitle: "Updates & Activity",
    screenSubtitle: "",
    todayHeading: "Live Today",
    earlierHeading: "Latest Shift Papers",
    showBroadcastItem: true,
    showDailyQuizItem: true,
    showStreakItem: true,
    showLatestPapers: true,
    latestPapersLimit: 3,
    items: [],
  },
  homeLayout: {
    enabled: false,
    showHomeBanners: false,
    featuredPaperId: 0,
    sections: DEFAULT_HOME_SECTIONS,
    moduleBadges: {},
  },
  customStudyModules: {
    enabled: false,
    items: [],
  },
  toolSwitches: {
    enabled: false,
    speedTestEnabled: true,
    questionBankEnabled: true,
    offlineDownloadEnabled: true,
    aiTranslationEnabled: true,
  },
  syllabusSync: {
    enabled: false,
    overrides: {},
  },
  telemetry: {
    enabled: false,
  },
  adsControl: {
    enabled: false,
    syncFromWebAds: true,
    showInHome: false,
    showInQuestionBank: false,
    showAfterResult: false,
    inlineInterval: 5,
    customPromo: {
      badge: "PRO PASS",
      title: "Unlock Complete SSC Test Pass",
      subtitle: "Unlimited mock tests, PDFs & bilingual detailed solutions.",
      ctaText: "View Plans →",
      targetUrl: "https://ssczone.com/pricing",
    },
  },
  packagesControl: {
    enabled: false,
    paywallMode: "banner_only",
    freePapersLimit: 5,
    upgradeTitle: "Upgrade to SSCZone Pro",
    upgradeSubtitle: "Unlock all shift papers & full solutions",
    upgradeUrl: "https://ssczone.com/pricing",
  },
};

export function mergeMobileAppConfig(raw: any): MobileAppConfig {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    ...DEFAULT_MOBILE_APP_CONFIG,
    ...src,
    announcement: {
      ...DEFAULT_MOBILE_APP_CONFIG.announcement,
      ...(src.announcement || {}),
    },
    version: {
      ...DEFAULT_MOBILE_APP_CONFIG.version,
      ...(src.version || {}),
    },
    features: {
      ...DEFAULT_MOBILE_APP_CONFIG.features,
      ...(src.features || {}),
    },
    homeBanners: Array.isArray(src.homeBanners)
      ? src.homeBanners
      : DEFAULT_MOBILE_APP_CONFIG.homeBanners,
    countdown: {
      ...DEFAULT_MOBILE_APP_CONFIG.countdown,
      ...(src.countdown || {}),
    },
    notificationsFeed: {
      ...DEFAULT_MOBILE_APP_CONFIG.notificationsFeed,
      ...(src.notificationsFeed || {}),
      items: Array.isArray(src.notificationsFeed?.items)
        ? src.notificationsFeed.items
        : [],
    },
    homeLayout: {
      ...DEFAULT_MOBILE_APP_CONFIG.homeLayout,
      ...(src.homeLayout || {}),
      sections:
        Array.isArray(src.homeLayout?.sections) && src.homeLayout.sections.length > 0
          ? src.homeLayout.sections
          : DEFAULT_HOME_SECTIONS,
      moduleBadges: {
        ...DEFAULT_MOBILE_APP_CONFIG.homeLayout.moduleBadges,
        ...(src.homeLayout?.moduleBadges || {}),
      },
    },
    customStudyModules: {
      ...DEFAULT_MOBILE_APP_CONFIG.customStudyModules,
      ...(src.customStudyModules || {}),
      items: Array.isArray(src.customStudyModules?.items)
        ? src.customStudyModules.items
        : DEFAULT_MOBILE_APP_CONFIG.customStudyModules.items,
    },
    toolSwitches: {
      ...DEFAULT_MOBILE_APP_CONFIG.toolSwitches,
      ...(src.toolSwitches || {}),
    },
    syllabusSync: {
      ...DEFAULT_MOBILE_APP_CONFIG.syllabusSync,
      ...(src.syllabusSync || {}),
      overrides:
        src.syllabusSync?.overrides && typeof src.syllabusSync.overrides === "object"
          ? src.syllabusSync.overrides
          : {},
    },
    telemetry: {
      ...DEFAULT_MOBILE_APP_CONFIG.telemetry,
      ...(src.telemetry || {}),
    },
    adsControl: {
      ...DEFAULT_MOBILE_APP_CONFIG.adsControl,
      ...(src.adsControl || {}),
      customPromo: {
        ...DEFAULT_MOBILE_APP_CONFIG.adsControl.customPromo,
        ...(src.adsControl?.customPromo || {}),
      },
    },
    packagesControl: {
      ...DEFAULT_MOBILE_APP_CONFIG.packagesControl,
      ...(src.packagesControl || {}),
    },
  };
}
