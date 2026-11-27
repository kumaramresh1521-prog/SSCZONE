import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const rawNext = requestUrl.searchParams.get("next") ?? "/exams";

  // Open redirect defense: Ensure relative path only (must start with "/" and not "//" or contain protocol)
  const next =
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.includes("://") &&
    !rawNext.includes("\\")
      ? rawNext
      : "/exams";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message || "auth_callback_failed")}`,
        request.url
      )
    );
  }

  if (tokenHash && type && ALLOWED_OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    });
    if (!error) {
      const target = type === "recovery" && next === "/exams" ? "/update-password" : next;
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message || "auth_callback_failed")}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
}
