import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  // If no Origin header (e.g. same-origin GET, form submit, or server-to-server), allow it
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host.toLowerCase(); // hostname:port
    const originHostname = originUrl.hostname.toLowerCase(); // hostname only

    // Read host header or reverse proxy forwarded headers
    const hostHeader = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").toLowerCase();
    const cleanHostHeader = hostHeader.split(",")[0].trim();
    const cleanHostName = cleanHostHeader.split(":")[0].trim();

    // 1. Direct host or hostname match
    if (originHost === cleanHostHeader || originHostname === cleanHostName) {
      return true;
    }

    // 2. Allow local development variants ONLY in non-production environments
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      const isOriginLocal =
        originHostname === "localhost" ||
        originHostname === "127.0.0.1" ||
        originHostname === "0.0.0.0" ||
        originHostname.startsWith("192.168.") ||
        originHostname.startsWith("10.") ||
        originHostname.startsWith("172.");

      const isHostLocal =
        cleanHostName === "localhost" ||
        cleanHostName === "127.0.0.1" ||
        cleanHostName === "0.0.0.0" ||
        cleanHostName.startsWith("192.168.") ||
        cleanHostName.startsWith("10.") ||
        cleanHostName.startsWith("172.");

      if (isOriginLocal && (isHostLocal || !cleanHostName)) {
        return true;
      }
    }

    // 3. Allow SSCZone official production domains
    if (
      originHostname === "ssczone.com" ||
      originHostname.endsWith(".ssczone.com") ||
      originHostname === "ssczone.in" ||
      originHostname.endsWith(".ssczone.in")
    ) {
      return true;
    }

    // 4. Compare with configured NEXT_PUBLIC_APP_URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      try {
        const parsedApp = new URL(appUrl);
        if (originHostname === parsedApp.hostname.toLowerCase()) {
          return true;
        }
      } catch {}
    }

    // 5. Compare with Next.js nextUrl hostname
    if (request.nextUrl && originHostname === request.nextUrl.hostname.toLowerCase()) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function requireAdmin(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
  }

  // Fast-path: Middleware has already authenticated user session and verified is_admin=true
  if (request.headers.get("x-admin-verified") === "ssczone-admin-verified") {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }

  return null;
}
