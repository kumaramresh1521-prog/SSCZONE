import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function isCallerAdmin(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    return !!data?.is_admin;
  } catch {
    return false;
  }
}

async function resolveUserIdByEmail(email: string): Promise<string | null> {
  // Fast indexed lookup in profiles first
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("email", email.trim())
    .maybeSingle();
  if (profile?.id) return profile.id;

  // Paginated fallback across auth.users
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data: userList, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error || !userList?.users?.length) break;
    const found = userList.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );
    if (found?.id) return found.id;
    if (userList.users.length < perPage) break;
    page += 1;
  }
  return null;
}

/**
 * POST /api/admin/users/reset-password
 * Allows admins to generate direct recovery links or set passwords directly
 */
export async function POST(req: NextRequest) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized. Admin privileges required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { userId, email, action = "generate_link", newPassword } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (action === "set_password") {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const targetUserId = userId || (await resolveUserIdByEmail(email));
      if (!targetUserId) {
        return NextResponse.json(
          { error: "User not found in authentication system" },
          { status: 404 }
        );
      }

      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        {
          password: newPassword,
          email_confirm: true,
        }
      );

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Password updated directly for ${email}! Student can now log in.`,
      });
    }

    // Default: generate recovery link (bypassing email rate limits & localhost Site URL)
    const reqOrigin = req.nextUrl.origin;
    const baseAppUrl =
      reqOrigin && !reqOrigin.includes("localhost")
        ? reqOrigin
        : process.env.NEXT_PUBLIC_APP_URL || "https://ssczone.com";
    const cleanBase = baseAppUrl.replace(/\/$/, "");
    const redirectTo = `${cleanBase}/auth/callback?next=/update-password`;

    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email.trim(),
      options: {
        redirectTo,
      },
    });

    if (linkErr) {
      return NextResponse.json({ error: linkErr.message }, { status: 500 });
    }

    const hashedToken = linkData?.properties?.hashed_token;
    // Direct app link using hashed_token never falls back to Supabase Dashboard's localhost Site URL
    const directAppLink = hashedToken
      ? `${cleanBase}/update-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
      : linkData?.properties?.action_link;

    return NextResponse.json({
      success: true,
      email,
      actionLink: directAppLink,
      supabaseActionLink: linkData?.properties?.action_link,
      hashedToken,
      message: "Direct password recovery link generated successfully!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process password reset" },
      { status: 500 }
    );
  }
}
