import { NextResponse } from "next/server";
import { getSessionGateConfigAsync, getSessionGateConfig } from "@/lib/session-gate-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const config = await getSessionGateConfigAsync();

    // Extract client IP address from standard headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    const realIp = request.headers.get("x-real-ip");
    
    let clientIp = cfConnectingIp || realIp;
    if (!clientIp && forwardedFor) {
      clientIp = forwardedFor.split(",")[0].trim();
    }
    if (!clientIp) {
      clientIp = "127.0.0.1";
    }

    return NextResponse.json({
      success: true,
      config,
      clientIp,
      serverTime: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      config: getSessionGateConfig(),
      clientIp: "127.0.0.1",
      serverTime: new Date().toISOString(),
    });
  }
}
