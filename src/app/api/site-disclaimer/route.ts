import { NextResponse } from "next/server";
import { getStaticPagesConfigAsync } from "@/lib/static-pages-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getStaticPagesConfigAsync();
    const disclaimer = config?.topDisclaimer;
    return NextResponse.json(
      {
        enabled: disclaimer ? disclaimer.enabled !== false : true,
        badgeText: disclaimer?.badgeText || "Disclaimer",
        text: disclaimer?.text || "",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ enabled: false, error: err.message }, { status: 500 });
  }
}
