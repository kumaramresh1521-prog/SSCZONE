import { NextResponse } from "next/server";
import { getNavigationConfig } from "@/lib/navigation-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const config = getNavigationConfig();
  
  // Return with zero-cache headers for real-time responsiveness
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
