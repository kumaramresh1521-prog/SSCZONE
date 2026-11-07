import { NextResponse } from "next/server";
import { getNavigationConfig } from "@/lib/navigation-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const config = getNavigationConfig();
  
  // Return with short cache headers for instant responsiveness
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
