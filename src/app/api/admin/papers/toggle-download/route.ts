import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "paper_settings.json");

function readPaperSettings(): Record<string, { allow_download: boolean }> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading paper_settings.json:", e);
  }
  return {};
}

function writePaperSettings(settings: Record<string, { allow_download: boolean }>) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing paper_settings.json:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { paperId, allowDownload } = await req.json();

    if (!paperId) {
      return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
    }

    const numericId = Number(paperId);
    const isAllowed = Boolean(allowDownload);

    // 1. Update database using Service Role:
    // We set test_type: 'pyq' for download allowed, 'mock' for CBT only (download disabled)
    const updatePayload: any = {
      test_type: isAllowed ? "pyq" : "mock"
    };

    // Try updating allow_download if column exists
    try {
      await supabaseAdmin.from("previous_papers").update({ ...updatePayload, allow_download: isAllowed }).eq("id", numericId);
    } catch {
      await supabaseAdmin.from("previous_papers").update(updatePayload).eq("id", numericId);
    }

    // 2. Persist to server-side JSON settings file
    const currentSettings = readPaperSettings();
    currentSettings[String(numericId)] = { allow_download: isAllowed };
    writePaperSettings(currentSettings);

    return NextResponse.json({
      success: true,
      paperId: numericId,
      allowDownload: isAllowed
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update download permission" }, { status: 500 });
  }
}

export async function GET() {
  const settings = readPaperSettings();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
