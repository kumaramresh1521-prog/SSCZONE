import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function isCallerAdmin() {
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

  return Boolean(data?.is_admin);
}

export async function GET() {
  try {
    if (!(await isCallerAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let database = false;
    try {
      const { error } = await supabaseAdmin
        .from("exams")
        .select("id", { head: true, count: "exact" });
      database = !error;
    } catch {
      database = false;
    }

    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      services: {
        supabase: {
          configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
          healthy: database,
        },
        razorpay: {
          configured: Boolean(
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
              process.env.RAZORPAY_KEY_ID &&
              process.env.RAZORPAY_KEY_SECRET
          ),
        },
        cloudinary: {
          configured: Boolean(
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
              process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          ),
        },
        adsense: {
          configured: Boolean(process.env.NEXT_PUBLIC_ADSENSE_ID),
        },
        googleAnalytics: {
          configured: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
        },
        cloudRun: {
          configured: Boolean(process.env.K_SERVICE),
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to check system status" }, { status: 500 });
  }
}
