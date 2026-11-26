import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { mergeMobileAppConfig } from "@/lib/mobile-app-config";
import { getAdsConfigAsync } from "@/lib/ads-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-cache, no-store, must-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Key",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const includeWeb = req.nextUrl.searchParams.get("includeWeb") === "1";

    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "mobile_app_config")
      .maybeSingle();

    const config = mergeMobileAppConfig(data?.value);

    // Only query ads/packages when explicitly enabled or requested by Admin preview
    if (
      includeWeb ||
      (config.adsControl.enabled && config.adsControl.syncFromWebAds) ||
      config.packagesControl.enabled
    ) {
      const [adsRes, pkgRes] = await Promise.allSettled([
        getAdsConfigAsync(),
        supabaseAdmin
          .from("packages")
          .select("id, title, exam_id, price, duration_days, features")
          .order("price"),
      ]);

      const payload: Record<string, any> = { ...config };

      if (adsRes.status === "fulfilled" && adsRes.value) {
        const activeSlots = Object.values(adsRes.value.slots || {})
          .filter((s) => s.enabled && (s.promoCard || s.affiliateBanner))
          .map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category || "custom",
            type: s.type,
            promoCard: s.promoCard || null,
            affiliateBanner: s.affiliateBanner || null,
          }));
        payload.resolvedAds = {
          enabledGlobally: Boolean(adsRes.value.enabledGlobally),
          inlineInterval: adsRes.value.inlineInterval || 5,
          slots: activeSlots,
        };
      }

      if (pkgRes.status === "fulfilled" && pkgRes.value.data) {
        payload.resolvedPackages = pkgRes.value.data;
      }

      return NextResponse.json(payload, { headers: CORS_HEADERS });
    }

    return NextResponse.json(config, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminKey = req.headers.get("x-admin-key");
    const expectedKey = process.env.ADMIN_SECRET_KEY || "ssczone-secure-gateway-2026";

    if (adminKey && adminKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sanitized = mergeMobileAppConfig(body);
    sanitized.updatedAt = new Date().toISOString();

    const { error } = await supabaseAdmin.from("site_settings").upsert(
      {
        key: "mobile_app_config",
        value: sanitized,
        updated_at: sanitized.updatedAt,
      },
      { onConflict: "key" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Mobile app configuration updated successfully", config: sanitized },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
