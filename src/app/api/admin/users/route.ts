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

export async function GET() {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [{ data: profiles }, { data: authList }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("*, subscriptions(status, expires_at, packages(title))")
        .order("created_at", { ascending: false }),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    const merged: any[] = [...(profiles || [])];

    // Include auth.users rows that may not yet have a profile row
    for (const au of authList?.users || []) {
      if (!profileMap.has(au.id)) {
        merged.push({
          id: au.id,
          email: au.email,
          full_name: au.user_metadata?.full_name || null,
          is_admin: false,
          created_at: au.created_at,
          subscriptions: [],
        });
      }
    }

    return NextResponse.json({ users: merged });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isCallerAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, is_admin, email, full_name } = await req.json();
    if (!id || typeof is_admin !== "boolean") {
      return NextResponse.json({ error: "id and is_admin boolean are required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("profiles").upsert({
      id,
      is_admin,
      ...(email ? { email } : {}),
      ...(full_name ? { full_name } : {}),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}
