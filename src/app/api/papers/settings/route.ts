import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "paper_settings.json");

function readPaperSettings(): Record<string, { allow_download?: boolean; allow_translation?: boolean }> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading paper_settings.json:", e);
  }
  return {};
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

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { paperId, allowDownload, allowTranslation } = await req.json();
    if (!paperId) {
      return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
    }
    const numericId = String(paperId);
    const settings = readPaperSettings();
    if (!settings[numericId]) {
      settings[numericId] = {};
    }
    if (allowDownload !== undefined) {
      settings[numericId].allow_download = Boolean(allowDownload);
    }
    if (allowTranslation !== undefined) {
      settings[numericId].allow_translation = Boolean(allowTranslation);
    }
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return NextResponse.json({ success: true, settings: settings[numericId] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
