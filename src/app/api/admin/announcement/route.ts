import { NextRequest, NextResponse } from "next/server";
import { getAnnouncementConfig, saveAnnouncementConfig, AnnouncementConfig } from "@/lib/announcements-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getAnnouncementConfig();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load announcement config" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AnnouncementConfig>;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload format" },
        { status: 400 }
      );
    }

    const saved = saveAnnouncementConfig(body);
    return NextResponse.json({
      success: true,
      message: "Announcement popup saved and synced successfully! 📢",
      config: saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save announcement config" },
      { status: 500 }
    );
  }
}
