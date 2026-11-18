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

export async function POST(req: NextRequest) {
  try {
    const { paperId, allowDownload } = await req.json();

    if (!paperId) {
      return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
    }

    const numericId = Number(paperId);
    const isAllowed = Boolean(allowDownload);

    // Database is the only durable store on Cloud Run.
    const { error } = await supabaseAdmin
      .from("previous_papers")
      .update({
        allow_download: isAllowed,
        test_type: isAllowed ? "pyq" : "mock",
      })
      .eq("id", numericId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paperId: numericId,
      allowDownload: isAllowed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update download permission" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("previous_papers")
    .select("id, allow_download");

  if (error) {
    return NextResponse.json({}, { status: 200 });
  }

  const settings: Record<string, { allow_download: boolean }> = {};
  (data || []).forEach((paper: any) => {
    if (paper.allow_download !== null && paper.allow_download !== undefined) {
      settings[String(paper.id)] = {
        allow_download: Boolean(paper.allow_download),
      };
    }
  });

  return NextResponse.json(settings, {
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
