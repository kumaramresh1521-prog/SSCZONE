import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getPublishedSeoConfigAsync, DEFAULT_SEO_CONFIG } from "@/lib/seo-store";

const SEO_FILE_PATH = path.join(process.cwd(), "src", "data", "seo-config.json");

export async function GET() {
  try {
    const config = await getPublishedSeoConfigAsync();
    return NextResponse.json(config);
  } catch (err: any) {
    console.error("Error reading SEO config:", err);
    return NextResponse.json(DEFAULT_SEO_CONFIG);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload.siteTitle || !payload.metaDescription) {
      return NextResponse.json(
        { error: "Site title and meta description are required." },
        { status: 400 }
      );
    }

    const updatedConfig = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    // 1. Save to local JSON file for atomic, low-latency SSR access
    const dir = path.dirname(SEO_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SEO_FILE_PATH, JSON.stringify(updatedConfig, null, 2), "utf8");

    // 2. Persist to Supabase site_settings table if available
    try {
      const { supabaseAdmin } = await import("@/lib/supabase-admin");
      await supabaseAdmin.from("site_settings").upsert(
        {
          key: "seo_config",
          value: updatedConfig,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      );
    } catch (dbErr) {
      // Supabase table might not exist yet; file backup is active
      console.warn("Could not sync SEO config to Supabase site_settings table:", dbErr);
    }

    // 3. Clear Next.js cache so changes immediately appear live on the website
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/papers");
      revalidatePath("/exams");
      revalidatePath("/notes");
      revalidatePath("/speed-test");
      revalidatePath("/daily-quiz");
      revalidatePath("/typing");
      revalidatePath("/about");
      revalidatePath("/blog");
      revalidatePath("/sitemap.xml");
      revalidatePath("/robots.txt");
    } catch (cacheErr) {
      console.warn("revalidatePath error:", cacheErr);
    }

    return NextResponse.json({
      success: true,
      message: "SEO configuration published successfully and live on the website!",
      config: updatedConfig
    });
  } catch (err: any) {
    console.error("Error saving SEO config:", err);
    return NextResponse.json(
      { error: "Failed to save SEO configuration: " + err.message },
      { status: 500 }
    );
  }
}
