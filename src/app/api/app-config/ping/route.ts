import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const version = String(body?.version || "1.1.0").slice(0, 24);
    const examSlug = String(body?.examSlug || "ssc-cgl").slice(0, 32);

    const { data: cfgRow } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "mobile_app_config")
      .maybeSingle();

    if (!cfgRow?.value?.telemetry?.enabled) {
      return NextResponse.json({ recorded: false, reason: "telemetry_disabled" }, { headers: CORS_HEADERS });
    }

    const { data: existing } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "mobile_app_telemetry")
      .maybeSingle();

    const prev = (existing?.value && typeof existing.value === "object" ? existing.value : {}) as any;
    const byVersion = { ...(prev.byVersion || {}) };
    const byExam = { ...(prev.byExam || {}) };
    byVersion[version] = Number(byVersion[version] || 0) + 1;
    byExam[examSlug] = Number(byExam[examSlug] || 0) + 1;

    const nextSummary = {
      totalPings: Number(prev.totalPings || 0) + 1,
      byVersion,
      byExam,
      lastPingAt: new Date().toISOString(),
    };

    await supabaseAdmin.from("site_settings").upsert(
      {
        key: "mobile_app_telemetry",
        value: nextSummary,
        updated_at: nextSummary.lastPingAt,
      },
      { onConflict: "key" }
    );

    return NextResponse.json({ recorded: true }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
