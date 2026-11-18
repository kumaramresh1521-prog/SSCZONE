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

    // 1. Persist to Supabase first: the Cloud Run filesystem is read-only and
    //    per-instance, so the JSON file cannot be the source of truth in prod.
    let dbSaved = false;
    try {
      const { supabaseAdmin } = await import("@/lib/supabase-admin");
      const { error } = await supabaseAdmin.from("site_settings").upsert(
        {
          key: "seo_config",
          value: updatedConfig,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      );
      if (error) {
        console.warn("Could not persist SEO config to Supabase:", error.message);
      } else {
        dbSaved = true;
      }
    } catch (dbErr) {
      console.warn("Could not persist SEO config to Supabase:", dbErr);
    }

    // 2. Local JSON backup for dev / writable environments (never fatal).
    let fileSaved = false;
    try {
      const dir = path.dirname(SEO_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SEO_FILE_PATH, JSON.stringify(updatedConfig, null, 2), "utf8");
      fileSaved = true;
    } catch (fileErr) {
      console.warn("Local SEO file backup skipped:", fileErr);
    }

    if (!dbSaved && !fileSaved) {
      return NextResponse.json(
        { error: "Failed to persist SEO configuration." },
        { status: 500 }
      );
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
