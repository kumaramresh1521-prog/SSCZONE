import { createClient } from "@supabase/supabase-js";

export interface CandidateTool {
  id: string;
  title: string;
  description: string;
  iconName: string; // e.g. "Image", "Trophy", "Calendar", "Keyboard", "CheckSquare", "Wrench"
  badge?: string;
  badgeColor?: string;
  href: string;
  gradient?: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  category?: "calculator" | "utility" | "practice" | "checklist";
}

export const DEFAULT_CANDIDATE_TOOLS: CandidateTool[] = [
  {
    id: "syllabus-tracker",
    title: "SSC Master Syllabus Tracker & OneNote Checklist",
    description: "Interactive notification-mapped chapter checklist for CGL 2026, CHSL, CPO, MTS & GD with 3-Pillar tracking (Theory, 50+ PYQs, 3x Revisions) & personal formula scratchpads.",
    iconName: "CheckSquare",
    badge: "⭐ 2026 FLAGSHIP",
    badgeColor: "bg-purple-600 text-white",
    href: "/syllabus",
    gradient: "from-purple-600 to-indigo-600",
    features: [
      "100% Notification Mapped for CGL, CHSL, CPO, MTS & GD",
      "3-Pillar Progress (📖 Theory, ⚡ 50+ PYQs, 🔄 3x Revisions)",
      "Personal OneNote Scratchpad & Printable A4 Study Sheet"
    ],
    isActive: true,
    sortOrder: 1,
    category: "checklist"
  },
  {
    id: "rank-predictor",
    title: "SSC Rank Predictor & Marks Calculator",
    description: "Paste your official SSC Answer Key link or enter raw scores to calculate category rank, shift difficulty, and normalized marks.",
    iconName: "Trophy",
    badge: "🔥 POPULAR",
    badgeColor: "bg-blue-600 text-white",
    href: "/toolkit/rank-predictor",
    gradient: "from-blue-600 to-indigo-600",
    features: [
      "Instant Raw Score & Negative Deduction",
      "Shift Difficulty & Expected Normalization",
      "All-India & Category Rank Estimate"
    ],
    isActive: true,
    sortOrder: 2,
    category: "calculator"
  },
  {
    id: "photo-resizer",
    title: "SSC Photo & Signature Resizer Tool",
    description: "Compress & resize passport photos (20-50 KB, 3.5×4.5 cm) and signatures (10-20 KB, 4.0×2.0 cm) for online application forms.",
    iconName: "Image",
    badge: "⚡ ZERO UPLOAD",
    badgeColor: "bg-teal-600 text-white",
    href: "/toolkit/photo-resizer",
    gradient: "from-teal-600 to-emerald-600",
    features: [
      "100% In-Browser Private Processing (Zero Server Upload)",
      "Strict SSC Dimensions (3.5x4.5 cm photo & 4.0x2.0 cm signature)",
      "Instant JPG Compression to exact 20-50 KB & 10-20 KB"
    ],
    isActive: true,
    sortOrder: 3,
    category: "utility"
  },
  {
    id: "typing-test",
    title: "SSC Typing Test 2000 Key Depressions Simulator",
    description: "TCS exam hall interface simulation with 15-minute countdown timer, 2000 key depressions tracking, WPM speed calculation, and full/half error analysis.",
    iconName: "Keyboard",
    badge: "⌨️ TCS EXAM HALL",
    badgeColor: "bg-amber-600 text-white",
    href: "/typing",
    gradient: "from-amber-600 to-orange-600",
    features: [
      "Exact TCS Exam Hall Split-Screen Keyboard Interface",
      "2000 Key Depressions in 15 Minutes Live Counter",
      "Full Error vs Half Error Percentage & Qualifying Status"
    ],
    isActive: true,
    sortOrder: 4,
    category: "practice"
  },
  {
    id: "age-calculator",
    title: "SSC Eligibility Age Calculator",
    description: "Calculate your exact age in years, months, and days as on official SSC cutoff dates with category age relaxation.",
    iconName: "Calendar",
    badge: "🎂 ACCURATE",
    badgeColor: "bg-indigo-600 text-white",
    href: "/toolkit/age-calculator",
    gradient: "from-indigo-600 to-purple-600",
    features: [
      "Exact Years, Months, and Days as of Cutoff Date",
      "UR, OBC (+3 yrs), SC/ST (+5 yrs), PwD (+10 yrs) Relaxations",
      "Instant Eligibility Result for SSC CGL, CHSL, CPO & MTS"
    ],
    isActive: true,
    sortOrder: 5,
    category: "calculator"
  }
];

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Fetch candidate tools (Checks Supabase site_settings first, then defaults)
 */
export async function getCandidateToolsAsync(): Promise<CandidateTool[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: row } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "candidate_tools")
      .maybeSingle();

    if (row?.value && Array.isArray(row.value) && row.value.length > 0) {
      return (row.value as CandidateTool[]).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
  } catch (err) {
    console.warn("Could not read candidate_tools from Supabase site_settings:", err);
  }

  return DEFAULT_CANDIDATE_TOOLS;
}

/**
 * Synchronous reader for simple fallbacks
 */
export function getCandidateToolsSync(): CandidateTool[] {
  return DEFAULT_CANDIDATE_TOOLS;
}

/**
 * Save candidate tools to Supabase site_settings table
 */
export async function saveCandidateToolsAsync(tools: CandidateTool[]): Promise<boolean> {
  let dbSaved = false;
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: "candidate_tools",
        value: tools,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    if (!error) {
      dbSaved = true;
    } else {
      console.warn("Supabase save candidate_tools error:", error.message);
    }
  } catch (err) {
    console.warn("Could not save candidate_tools to Supabase:", err);
  }

  return dbSaved;
}
