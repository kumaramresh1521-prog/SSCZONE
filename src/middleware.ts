import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // Early return for public static/data routes that don't need auth checks
  const isProtectedAdmin = path.startsWith("/admin");
  const isProtectedAdminApi = path.startsWith("/api/admin");
  const isProtectedDashboard = path.startsWith("/dashboard");
  const isAuthPage = path === "/login" || path === "/signup";

  if (!isProtectedAdmin && !isProtectedAdminApi && !isProtectedDashboard && !isAuthPage) {
    return supabaseResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (isProtectedAdminApi) {
      return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
    }
    if (isProtectedAdmin || isProtectedDashboard) {
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

    // Protect admin API routes
    if (isProtectedAdminApi) {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
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
      if (!user) {
        return redirectWithAuthCookies(`/login?next=${encodeURIComponent(path)}`);
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        return redirectWithAuthCookies("/dashboard");
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
      return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
    }
    if (isProtectedAdmin || isProtectedDashboard) {
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
