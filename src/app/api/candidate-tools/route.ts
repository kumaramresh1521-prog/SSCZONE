import { NextRequest, NextResponse } from "next/server";
import { getCandidateToolsAsync, saveCandidateToolsAsync, CandidateTool } from "@/lib/candidate-tools-store";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";
    const tools = await getCandidateToolsAsync();
    const result = showAll ? tools : tools.filter((t) => t.isActive !== false);

    return NextResponse.json(
      { success: true, count: result.length, tools: result },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch candidate tools" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { tools } = body;

    if (!Array.isArray(tools)) {
      return NextResponse.json({ error: "Invalid tools payload. Expected an array." }, { status: 400 });
    }

    const saved = await saveCandidateToolsAsync(tools);

    return NextResponse.json({
      success: true,
      message: "Candidate tools saved successfully in Supabase site_settings.",
      count: tools.length,
      dbSaved: saved,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to save candidate tools" }, { status: 500 });
  }
}
