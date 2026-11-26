export interface AnnouncementAction {
  text: string;
  url?: string;
  isDismiss?: boolean;
  isExternal?: boolean;
}

export interface AnnouncementConfig {
  enabled: boolean;
  version: string; // e.g. "v1_answerkey_2026" or timestamp
  badge: string; // e.g. "🚨 OFFICIAL UPDATE"
  title: string;
  message: string;
  imageUrl?: string;
  primaryButton: AnnouncementAction;
  secondaryButton?: AnnouncementAction;
  showDelaySec: number;
  updatedAt?: string;
}

export const DEFAULT_ANNOUNCEMENT_CONFIG: AnnouncementConfig = {
  enabled: false,
  version: "ann_cgl_answerkey_v1",
  badge: "🚨 URGENT NOTIFICATION",
  title: "Official Tier-1 Answer Key Published!",
  message: "Staff Selection Commission has uploaded the official tentative answer keys for SSC CGL Examination. Calculate your raw score & check normalized cutoffs instantly.",
  imageUrl: "https://images.unsplash.com/photo-1584697964190-71c4c81b95ff?w=800&auto=format&fit=crop&q=80",
  primaryButton: {
    text: "Check Your Score Now →",
    url: "/papers?exam=cgl",
    isDismiss: false,
    isExternal: false,
  },
  secondaryButton: {
    text: "Remind Me Later",
    isDismiss: true,
  },
  showDelaySec: 1.5,
  updatedAt: new Date().toISOString(),
};
