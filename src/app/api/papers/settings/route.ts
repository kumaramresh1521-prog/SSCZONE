import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type PaperSetting = {
  allow_download?: boolean;
  allow_translation?: boolean;
};

/**
 * Source of truth is the database, not the container filesystem.
 * Cloud Run's filesystem is read-only and per-instance, so JSON files were
 * never persisted reliably in production.
 */
async function readPaperSettings(): Promise<Record<string, PaperSetting>> {
  const settings: Record<string, PaperSetting> = {};

  const { data: papers } = await supabaseAdmin
    .from("previous_papers")
    .select("id, allow_download");

  (papers || []).forEach((paper: any) => {
    if (paper.allow_download !== null && paper.allow_download !== undefined) {
      settings[String(paper.id)] = {
        allow_download: Boolean(paper.allow_download),
      };
    }
  });

  const { data: row } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "paper_settings")
    .maybeSingle();

  const overrides = row?.value;
  if (overrides && typeof overrides === "object" && !Array.isArray(overrides)) {
    for (const [id, value] of Object.entries(
      overrides as Record<string, PaperSetting>
    )) {
      settings[id] = { ...(settings[id] || {}), ...(value || {}) };
    }
  }

  return settings;
}

function noStoreHeaders() {
  return {
    "Cache-Control":
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
  });
}

export async function GET() {
  try {
    const settings = await readPaperSettings();
    return NextResponse.json(settings, { headers: noStoreHeaders() });
  } catch (err: any) {
    console.error("Error reading paper settings from DB:", err);
    return NextResponse.json({}, { headers: noStoreHeaders() });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { paperId, allowDownload, allowTranslation } = await req.json();
    if (!paperId) {
      return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
    }

    const numericId = Number(paperId);
    const id = String(paperId);

    if (allowDownload !== undefined) {
      const { error } = await supabaseAdmin
        .from("previous_papers")
        .update({ allow_download: Boolean(allowDownload) })
        .eq("id", numericId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (allowTranslation !== undefined) {
      const { data: row } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", "paper_settings")
        .maybeSingle();

      const current =
        row?.value &&
        typeof row.value === "object" &&
        !Array.isArray(row.value)
          ? (row.value as Record<string, PaperSetting>)
          : {};

      current[id] = {
        ...(current[id] || {}),
        allow_translation: Boolean(allowTranslation),
      };

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
    }

    const settings = await readPaperSettings();
    return NextResponse.json({ success: true, settings: settings[id] || {} });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
