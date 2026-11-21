import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
const ADMIN_GATE_COOKIE = "ssczone_admin_pass";

// Deterministic HMAC-like SHA-256 hash using Web Crypto for gate pass verification
async function getGateExpectedHash(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`ssc_admin_gate_v1:${secret}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  // Strip any inbound verification headers to prevent client-side spoofing
  requestHeaders.delete("x-admin-verified");
  requestHeaders.delete("x-admin-user-id");

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const path = request.nextUrl.pathname;
  const isProtectedAdmin = path.startsWith("/admin");
  const isProtectedAdminApi = path.startsWith("/api/admin");
  const isProtectedDashboard = path.startsWith("/dashboard");
  const isAuthPage = path === "/login" || path === "/signup";
  const isGateRoute = path === "/admin-gate" || path === "/portal-gate";

  // Check if request supplies the admin secret access key
  const providedKey =
    request.nextUrl.searchParams.get("key") ||
    request.nextUrl.searchParams.get("secret") ||
    request.nextUrl.searchParams.get("gate");

  const expectedGateHash = ADMIN_SECRET_KEY ? await getGateExpectedHash(ADMIN_SECRET_KEY) : null;

  // If secret key is provided and matches, unlock the stealth gate
  if (ADMIN_SECRET_KEY && providedKey && providedKey === ADMIN_SECRET_KEY) {
    // Redirect cleanly to /admin with secret parameter stripped from the URL
    const cleanUrl = new URL("/admin", request.url);
    const unlockResponse = NextResponse.redirect(cleanUrl);
    if (expectedGateHash) {
      unlockResponse.cookies.set(ADMIN_GATE_COOKIE, expectedGateHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    return unlockResponse;
  }

  // If someone accesses secret gate entry routes without the valid key, return 404
  if (isGateRoute) {
    return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
  }

  // Early return for public static/data routes that don't need auth checks
  if (!isProtectedAdmin && !isProtectedAdminApi && !isProtectedDashboard && !isAuthPage) {
    return supabaseResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (isProtectedAdminApi) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    if (isProtectedAdmin) {
      return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
    }
    if (isProtectedDashboard) {
      return NextResponse.redirect(new URL("/login?error=configuration", request.url));
    }
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const redirectWithAuthCookies = (destination: string) => {
      const redirectResponse = NextResponse.redirect(new URL(destination, request.url));
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    };

    // Retrieve user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect logged-in users away from login/signup
    if (isAuthPage && user) {
      return redirectWithAuthCookies("/dashboard");
    }

    // Check gate pass cookie
    const gateCookie = request.cookies.get(ADMIN_GATE_COOKIE);
    const hasValidGateCookie = !!expectedGateHash && gateCookie?.value === expectedGateHash;

    // Check if user is an admin
    let isUserAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      isUserAdmin = !!profile?.is_admin;
    }

    // Protect admin API routes
    if (isProtectedAdminApi) {
      // Allow lock endpoint through without prior admin checks so tokens can be cleared
      if (path === "/api/admin/gate/lock") {
        return supabaseResponse;
      }

      if (!user || !isUserAdmin) {
        // Return 404 Not Found to prevent endpoint enumeration
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }

      // Pre-verified by middleware: pass verification forward so route handlers skip duplicate round trips
      requestHeaders.set("x-admin-verified", "ssczone-admin-verified");
      requestHeaders.set("x-admin-user-id", user.id);

      const forwardResponse = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        forwardResponse.cookies.set(cookie);
      });
      return forwardResponse;
    }

    // Protect admin UI routes
    if (isProtectedAdmin) {
      // STEALTH CHECK:
      // If the visitor has NEITHER a verified admin user session NOR a valid secret gate cookie,
      // return a pure 404 Not Found rewrite so /admin is completely invisible from scanners.
      if (!isUserAdmin && !hasValidGateCookie) {
        return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
      }

      // If user is not logged in yet, but has unlocked the gate via secret key, redirect to login
      if (!user) {
        return redirectWithAuthCookies(`/login?next=${encodeURIComponent(path)}`);
      }

      // If user is logged in, but is NOT an admin (e.g. student), return 404
      if (!isUserAdmin) {
        return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
      }

      // Verified admin: refresh the gate pass cookie if not present
      if (!hasValidGateCookie && expectedGateHash) {
        supabaseResponse.cookies.set(ADMIN_GATE_COOKIE, expectedGateHash, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }
    }

    // Protect dashboard routes
    if (isProtectedDashboard && !user) {
      return redirectWithAuthCookies(`/login?next=${encodeURIComponent(path)}`);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("Middleware authentication error:", err);
    if (isProtectedAdminApi) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    if (isProtectedAdmin) {
      return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
    }
    if (isProtectedDashboard) {
      return NextResponse.redirect(new URL("/login?error=authentication", request.url));
    }
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
