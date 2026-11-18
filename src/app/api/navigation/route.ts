import { NextResponse } from "next/server";
import { getNavigationConfigAsync } from "@/lib/navigation-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const config = await getNavigationConfigAsync();
  
  // Return with zero-cache headers for instant real-time synchronization
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
