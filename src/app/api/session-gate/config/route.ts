import { NextResponse } from "next/server";
import { getSessionGateConfig } from "@/lib/session-gate-store";

export async function GET(request: Request) {
  try {
    const config = getSessionGateConfig();

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
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load session gate config" },
      { status: 500 }
    );
  }
}
