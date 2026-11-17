import { NextResponse } from "next/server";
import { getAnnouncementConfig } from "@/lib/announcements-store";

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
