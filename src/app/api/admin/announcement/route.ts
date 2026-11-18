import { NextRequest, NextResponse } from "next/server";
import {
  getAnnouncementConfigAsync,
  saveAnnouncementConfigAsync,
  AnnouncementConfig,
} from "@/lib/announcements-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getAnnouncementConfigAsync();
    return NextResponse.json({ success: true, config }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
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

    const saved = await saveAnnouncementConfigAsync(body);
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
