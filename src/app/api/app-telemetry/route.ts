import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getAdsConfigAsync } from "@/lib/ads-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET() {
  try {
    const nowIso = new Date().toISOString();

    const [
      usersRes,
      examsRes,
      papersRes,
      questionsRes,
      bookmarksRes,
      syllabusRes,
      attemptsRes,
      reportsCountRes,
      recentReportsRes,
      packagesRes,
      activeSubsRes,
      adsRes,
      pingRes,
    ] = await Promise.allSettled([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("exams")
        .select("id, title, slug, is_active, papers_count")
        .order("id", { ascending: true }),
      supabaseAdmin.from("previous_papers").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("questions").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("bookmarks").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("user_syllabus_progress").select("chapter_id", { count: "exact", head: true }),
      supabaseAdmin.from("test_attempts").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("question_reports").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("question_reports")
        .select("id, question_id, reason, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabaseAdmin
        .from("packages")
        .select("id, title, exam_id, price, duration_days, features")
        .order("price"),
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gte("expires_at", nowIso),
      getAdsConfigAsync(),
      supabaseAdmin
        .from("site_settings")
        .select("value, updated_at")
        .eq("key", "mobile_app_telemetry")
        .maybeSingle(),
    ]);

    const getCount = (res: PromiseSettledResult<any>) =>
      res.status === "fulfilled" && !res.value?.error ? Number(res.value?.count || 0) : 0;

    const exams =
      examsRes.status === "fulfilled" && Array.isArray(examsRes.value?.data)
        ? examsRes.value.data
        : [];

    const recentReports =
      recentReportsRes.status === "fulfilled" && Array.isArray(recentReportsRes.value?.data)
        ? recentReportsRes.value.data
        : [];

    const packages =
      packagesRes.status === "fulfilled" && Array.isArray(packagesRes.value?.data)
        ? packagesRes.value.data
        : [];

    const adsConfig = adsRes.status === "fulfilled" ? adsRes.value : null;
    const adSlots = adsConfig
      ? Object.values(adsConfig.slots || {}).map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category || "custom",
          type: s.type,
          enabled: Boolean(s.enabled),
          title: s.promoCard?.title || s.affiliateBanner?.title || s.name,
        }))
      : [];

    const pingSummary =
      pingRes.status === "fulfilled" && pingRes.value?.data?.value
        ? pingRes.value.data.value
        : { totalPings: 0, byVersion: {}, byExam: {}, lastPingAt: null };

    return NextResponse.json(
      {
        checkedAt: nowIso,
        counts: {
          users: getCount(usersRes),
          exams: exams.filter((e: any) => e.is_active !== false).length,
          totalExams: exams.length,
          papers: getCount(papersRes),
          questions: getCount(questionsRes),
          bookmarks: getCount(bookmarksRes),
          syllabusRows: getCount(syllabusRes),
          testAttempts: getCount(attemptsRes),
          reports: getCount(reportsCountRes),
          activeSubscriptions: getCount(activeSubsRes),
          packages: packages.length,
        },
        exams,
        recentReports,
        packages,
        adsSummary: {
          enabledGlobally: Boolean(adsConfig?.enabledGlobally),
          inlineInterval: adsConfig?.inlineInterval || 5,
          slots: adSlots,
        },
        pingSummary,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load mobile telemetry" },
      { status: 500 }
    );
  }
}
