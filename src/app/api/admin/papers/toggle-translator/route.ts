import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type PaperSettingsMap = Record<
  string,
  { allow_download?: boolean; allow_translation?: boolean }
>;

async function readTranslationOverrides(): Promise<PaperSettingsMap> {
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "paper_settings")
    .maybeSingle();

  const value = data?.value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as PaperSettingsMap;
  }
  return {};
}

export async function POST(req: NextRequest) {
  try {
    const { paperId, allowTranslation } = await req.json();

    if (!paperId) {
      return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
    }

    const numericId = Number(paperId);
    const id = String(paperId);
    const isAllowed = Boolean(allowTranslation);

    // `previous_papers.allow_translation` does not exist in the live schema,
    // so the durable store is site_settings (Cloud Run FS is ephemeral).
    const current = await readTranslationOverrides();
    current[id] = { ...(current[id] || {}), allow_translation: isAllowed };

    const { error } = await supabaseAdmin.from("site_settings").upsert(
      {
        key: "paper_settings",
        value: current,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paperId: numericId,
      allowTranslation: isAllowed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update translator permission" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const settings = await readTranslationOverrides();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
